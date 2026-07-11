const makeResponse = () => {
    const res = {
        statusCode: undefined,
        body: undefined,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        }
    };

    return res;
};

const assertNextNotCalled = (assert, nextCalls) => {
    assert.deepStrictEqual(nextCalls, []);
};

module.exports = {
    makeResponse,
    assertNextNotCalled
};
