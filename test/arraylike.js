"use strict";

describe("arraylike", function () {

    describe("gpf.isArrayLike", function () {

        it("checks if an object looks like an array", function () {
            assert(true === gpf.isArrayLike([]));
        });

        it("recognizes a simulated array", function () {
            assert(true === gpf.isArrayLike({
                length: 2,
                "0": 0,
                "1": 1
            }));
        });

        it("recognizes a simulated empty array", function () {
            assert(true === gpf.isArrayLike({length: 0}));
        });

        it("recognizes a simulated incomplete array", function () {
            assert(true === gpf.isArrayLike({
                length: 2,
                "1": 1
            }));
        });

        it("recognizes a simulated non empty array with no items", function () {
            assert(true === gpf.isArrayLike({
                length: 2
            }));
        });

        it("accepts a string as an array like", function () {
            assert(true === gpf.isArrayLike("abc"));
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
                assert(false === gpf.isArrayLike(value));
            });
        });

        it("rejects a simulated array with an invalid length property", function () {
            assert(false === gpf.isArrayLike({
                length: 2.5,
                "0": 0,
                "1": 1
            }));
        });

    });

});
