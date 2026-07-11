const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

const Event = require("../models/Event");
const Registration = require("../models/Registration");
const {
    registerAttendee,
    getAttendees,
    deleteRegistration
} = require("../controllers/registrationController");
const { makeResponse, assertNextNotCalled } = require("./helpers");

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

const makeSession = () => ({
    started: false,
    committed: false,
    aborted: false,
    ended: false,
    startTransaction() {
        this.started = true;
    },
    async commitTransaction() {
        this.committed = true;
    },
    async abortTransaction() {
        this.aborted = true;
    },
    endSession() {
        this.ended = true;
    }
});

const sessionResult = (value) => ({
    session() {
        return Promise.resolve(value);
    }
});

test("registerAttendee creates a registration when the event is open and has capacity", async () => {
    const nextCalls = [];
    const session = makeSession();
    const registration = { _id: "registration-1", eventId: "event-1", name: "Omar", email: "omar@example.com" };
    let lockUpdated = false;

    await withPatchedMethods([
        [mongoose, "startSession", async () => session],
        [Event, "findById", () => sessionResult({
            _id: "event-1",
            capacity: 2,
            date: new Date("2099-01-01T00:00:00.000Z")
        })],
        [Registration, "countDocuments", () => sessionResult(1)],
        [Registration, "findOne", () => sessionResult(null)],
        [Event, "findOneAndUpdate", (query, update) => {
            assert.deepStrictEqual(query, { _id: "event-1" });
            assert.ok(update.$set.updatedAt instanceof Date);
            lockUpdated = true;
            return sessionResult({});
        }],
        [Registration, "create", async (documents, options) => {
            assert.deepStrictEqual(documents, [{
                eventId: "event-1",
                name: "Omar",
                email: "omar@example.com"
            }]);
            assert.deepStrictEqual(options, { session });
            return [registration];
        }]
    ], async () => {
        const res = makeResponse();

        await registerAttendee({
            params: { id: "event-1" },
            body: { name: "Omar", email: "omar@example.com" }
        }, res, (error) => nextCalls.push(error));

        assert.equal(res.statusCode, 200);
        assert.deepStrictEqual(res.body, { success: true, data: registration });
        assert.equal(session.started, true);
        assert.equal(session.committed, true);
        assert.equal(session.aborted, false);
        assert.equal(session.ended, true);
        assert.equal(lockUpdated, true);
        assertNextNotCalled(assert, nextCalls);
    });
});

test("registerAttendee rejects duplicate registration and aborts transaction", async () => {
    const nextCalls = [];
    const session = makeSession();
    let createCalled = false;

    await withPatchedMethods([
        [mongoose, "startSession", async () => session],
        [Event, "findById", () => sessionResult({
            _id: "event-1",
            capacity: 5,
            date: new Date("2099-01-01T00:00:00.000Z")
        })],
        [Registration, "countDocuments", () => sessionResult(1)],
        [Registration, "findOne", () => sessionResult({ _id: "registration-1" })],
        [Registration, "create", async () => {
            createCalled = true;
        }]
    ], async () => {
        const res = makeResponse();

        await registerAttendee({
            params: { id: "event-1" },
            body: { name: "Omar", email: "omar@example.com" }
        }, res, (error) => nextCalls.push(error));

        assert.equal(res.statusCode, 400);
        assert.deepStrictEqual(res.body, { success: false, message: "Already registered" });
        assert.equal(session.committed, false);
        assert.equal(session.aborted, true);
        assert.equal(session.ended, true);
        assert.equal(createCalled, false);
        assertNextNotCalled(assert, nextCalls);
    });
});

test("registerAttendee rejects full events before checking duplicate email", async () => {
    const nextCalls = [];
    const session = makeSession();
    let duplicateLookupCalled = false;

    await withPatchedMethods([
        [mongoose, "startSession", async () => session],
        [Event, "findById", () => sessionResult({
            _id: "event-1",
            capacity: 2,
            date: new Date("2099-01-01T00:00:00.000Z")
        })],
        [Registration, "countDocuments", () => sessionResult(2)],
        [Registration, "findOne", () => {
            duplicateLookupCalled = true;
            return sessionResult(null);
        }]
    ], async () => {
        const res = makeResponse();

        await registerAttendee({
            params: { id: "event-1" },
            body: { name: "Omar", email: "omar@example.com" }
        }, res, (error) => nextCalls.push(error));

        assert.equal(res.statusCode, 400);
        assert.deepStrictEqual(res.body, { success: false, message: "Event is at capacity" });
        assert.equal(duplicateLookupCalled, false);
        assert.equal(session.aborted, true);
        assert.equal(session.ended, true);
        assertNextNotCalled(assert, nextCalls);
    });
});

test("getAttendees returns only attendee name and email fields", async () => {
    const nextCalls = [];
    const attendees = [{ name: "Omar", email: "omar@example.com" }];
    let selectedFields;

    await withPatchedMethods([
        [Registration, "find", (query) => {
            assert.deepStrictEqual(query, { eventId: "event-1" });
            return {
                async select(fields) {
                    selectedFields = fields;
                    return attendees;
                }
            };
        }]
    ], async () => {
        const res = makeResponse();

        await getAttendees({ params: { id: "event-1" } }, res, (error) => nextCalls.push(error));

        assert.equal(res.statusCode, 200);
        assert.equal(selectedFields, "name email");
        assert.deepStrictEqual(res.body, { success: true, data: attendees });
        assertNextNotCalled(assert, nextCalls);
    });
});

test("deleteRegistration returns 404 when registration is not linked to event", async () => {
    const nextCalls = [];

    await withPatchedMethods([
        [Registration, "findOneAndDelete", async (query) => {
            assert.deepStrictEqual(query, { _id: "registration-1", eventId: "event-1" });
            return null;
        }]
    ], async () => {
        const res = makeResponse();

        await deleteRegistration({
            params: { id: "event-1", registrationId: "registration-1" }
        }, res, (error) => nextCalls.push(error));

        assert.equal(res.statusCode, 404);
        assert.deepStrictEqual(res.body, { success: false, message: "Registration not found" });
        assertNextNotCalled(assert, nextCalls);
    });
});
