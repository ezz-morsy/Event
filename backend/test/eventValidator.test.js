const test = require("node:test");
const assert = require("node:assert/strict");
const validateEvent = require("../utilities/eventValidator");

const validEvent = {
    title: "Web Summit",
    category: "Technology",
    location: "Cairo",
    date: "2026-09-15",
    capacity: 120,
    description: "Training and networking event"
};

test("validateEvent returns no errors for a complete valid event", () => {
    assert.deepStrictEqual(validateEvent(validEvent), []);
});

test("validateEvent reports all required fields when event is empty", () => {
    const errors = validateEvent({});

    assert.deepStrictEqual(
        errors.map((error) => error.field),
        ["title", "category", "location", "date", "capacity", "description"]
    );
});

test("validateEvent rejects zero, negative, and non-numeric capacity values", () => {
    for (const capacity of [0, -1, "abc"]) {
        const errors = validateEvent({ ...validEvent, capacity });

        assert.deepStrictEqual(errors, [{
            field: "capacity",
            message: "Capacity must be greater than 0"
        }]);
    }
});

test("validateEvent accepts numeric capacity strings", () => {
    assert.deepStrictEqual(validateEvent({ ...validEvent, capacity: "25" }), []);
});
