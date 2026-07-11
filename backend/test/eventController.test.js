const test = require("node:test");
const assert = require("node:assert/strict");

const Event = require("../models/Event");
const Registration = require("../models/Registration");
const {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
} = require("../controllers/eventController");
const { makeResponse, assertNextNotCalled } = require("./helpers");

const validEventBody = {
    title: "Web Summit",
    category: "Technology",
    location: "Cairo",
    date: "2026-09-15",
    capacity: 120,
    description: "Training and networking event"
};

const withPatchedMethods = async (patches, run) => {
    const originals = patches.map(([target, method]) => [target, method, target[method]]);

    for (const [target, method, replacement] of patches) {
        target[method] = replacement;
    }

    try {
        await run();
    } finally {
        for (const [target, method, original] of originals) {
            target[method] = original;
        }
    }
};

test("getEvents builds search, category, location, and date filters", async () => {
    const nextCalls = [];
    let capturedQuery;
    const foundEvents = [{ title: "Node Day" }];

    await withPatchedMethods([
        [Event, "find", async (query) => {
            capturedQuery = query;
            return foundEvents;
        }]
    ], async () => {
        const req = {
            query: {
                search: "node",
                category: "Technology",
                location: "Cairo",
                date: "2026-09-15"
            }
        };
        const res = makeResponse();

        await getEvents(req, res, (error) => nextCalls.push(error));

        assert.equal(res.statusCode, 200);
        assert.deepStrictEqual(res.body, { success: true, data: foundEvents });
        assert.deepStrictEqual(capturedQuery.title, { $regex: "node", $options: "i" });
        assert.equal(capturedQuery.category, "Technology");
        assert.equal(capturedQuery.location, "Cairo");
        assert.equal(capturedQuery.date.$gte.toISOString(), "2026-09-15T00:00:00.000Z");
        assert.equal(capturedQuery.date.$lte.toISOString(), "2026-09-15T23:59:59.999Z");
        assertNextNotCalled(assert, nextCalls);
    });
});

test("createEvent rejects invalid request bodies before creating a record", async () => {
    const nextCalls = [];
    let createCalled = false;

    await withPatchedMethods([
        [Event, "create", async () => {
            createCalled = true;
        }]
    ], async () => {
        const res = makeResponse();

        await createEvent({ body: {} }, res, (error) => nextCalls.push(error));

        assert.equal(res.statusCode, 400);
        assert.equal(res.body.success, false);
        assert.equal(res.body.errors.length, 6);
        assert.equal(createCalled, false);
        assertNextNotCalled(assert, nextCalls);
    });
});

test("createEvent returns created event for valid request bodies", async () => {
    const nextCalls = [];
    const createdEvent = { _id: "event-1", ...validEventBody };

    await withPatchedMethods([
        [Event, "create", async (body) => {
            assert.deepStrictEqual(body, validEventBody);
            return createdEvent;
        }]
    ], async () => {
        const res = makeResponse();

        await createEvent({ body: validEventBody }, res, (error) => nextCalls.push(error));

        assert.equal(res.statusCode, 200);
        assert.deepStrictEqual(res.body, { success: true, data: createdEvent });
        assertNextNotCalled(assert, nextCalls);
    });
});

test("updateEvent prevents capacity from being reduced below registrations", async () => {
    const nextCalls = [];
    let updateCalled = false;

    await withPatchedMethods([
        [Registration, "countDocuments", async (query) => {
            assert.deepStrictEqual(query, { eventId: "event-1" });
            return 8;
        }],
        [Event, "findByIdAndUpdate", async () => {
            updateCalled = true;
        }]
    ], async () => {
        const res = makeResponse();

        await updateEvent({
            params: { id: "event-1" },
            body: { ...validEventBody, capacity: 5 }
        }, res, (error) => nextCalls.push(error));

        assert.equal(res.statusCode, 400);
        assert.equal(res.body.success, false);
        assert.deepStrictEqual(res.body.errors, [{
            field: "capacity",
            message: "Capacity cannot be reduced below the number of registered attendees (8)"
        }]);
        assert.equal(updateCalled, false);
        assertNextNotCalled(assert, nextCalls);
    });
});

test("getEventById converts missing or invalid ids to a 404 response", async () => {
    const nextCalls = [];

    await withPatchedMethods([
        [Event, "findById", async (id) => {
            if (id === "missing") {
                return null;
            }
            const error = new Error("Invalid id");
            error.name = "CastError";
            throw error;
        }]
    ], async () => {
        const missingResponse = makeResponse();
        await getEventById({ params: { id: "missing" } }, missingResponse, (error) => nextCalls.push(error));

        assert.equal(missingResponse.statusCode, 404);
        assert.deepStrictEqual(missingResponse.body, { success: false, message: "Event not found" });

        const invalidResponse = makeResponse();
        await getEventById({ params: { id: "bad-id" } }, invalidResponse, (error) => nextCalls.push(error));

        assert.equal(invalidResponse.statusCode, 404);
        assert.deepStrictEqual(invalidResponse.body, { success: false, message: "Event not found" });
        assertNextNotCalled(assert, nextCalls);
    });
});

test("deleteEvent cascades registration cleanup after deleting an event", async () => {
    const nextCalls = [];
    const deletedEvent = { _id: "event-1" };
    let deletedRegistrationsFor;

    await withPatchedMethods([
        [Event, "findByIdAndDelete", async (id) => {
            assert.equal(id, "event-1");
            return deletedEvent;
        }],
        [Registration, "deleteMany", async (query) => {
            deletedRegistrationsFor = query;
        }]
    ], async () => {
        const res = makeResponse();

        await deleteEvent({ params: { id: "event-1" } }, res, (error) => nextCalls.push(error));

        assert.equal(res.statusCode, 200);
        assert.deepStrictEqual(res.body, { success: true, message: "Event deleted" });
        assert.deepStrictEqual(deletedRegistrationsFor, { eventId: "event-1" });
        assertNextNotCalled(assert, nextCalls);
    });
});
