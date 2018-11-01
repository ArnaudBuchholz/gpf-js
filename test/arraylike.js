"use strict";

describe("arraylike", function () {

    describe("gpf.isArrayLike", function () {

        it("checks if an object looks like an array", function () {
            assert(gpf.isArrayLike([]) === true);
        });

        it("recognizes a simulated array", function () {
            assert(gpf.isArrayLike({
                length: 2,
                "0": 0,
                "1": 1
            }) === true);
        });

        it("recognizes a simulated empty array", function () {
            assert(gpf.isArrayLike({length: 0}) === true);
        });

        it("recognizes a simulated incomplete array", function () {
            assert(gpf.isArrayLike({
                length: 2,
                "1": 1
            }) === true);
        });

        it("recognizes a simulated non empty array with no items", function () {
            assert(gpf.isArrayLike({
                length: 2
            }) === true);
        });

        it("accepts a string as an array like", function () {
            assert(gpf.isArrayLike("abc") === true);
        });

        [
            null,
            undefined,
            0,
            1,
            false,
            true,
            {},
            new Date()
        ].forEach(function (value) {
            it("rejects any non fitting value (" + JSON.stringify(value) + ")", function () {
                assert(gpf.isArrayLike(value) === false);
            });
        });

        it("rejects a simulated array with an invalid length property", function () {
            assert(gpf.isArrayLike({
                length: 2.5,
                "0": 0,
                "1": 1
            }) === false);
        });

    });

});
