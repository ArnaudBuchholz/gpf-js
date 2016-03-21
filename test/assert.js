"use strict";

describe("assert", function () {

    describe("gpf.assert", function () {

        [
            true,
            42,
            "Hello World!",
            {}
        ].forEach(function (value) {
            it("does nothing on a truthy condition - " + typeof value + " (" + value.toString() + ")", function () {
                gpf.assert(value, "It works");
            });
        });

        [
            false,
            0,
            "",
            undefined,
            null
        ].forEach(function (value) {
            var stringValue;
            if (undefined === stringValue) {
                stringValue = "undefined";
            } else if (null === stringValue) {
                stringValue = "null";
            } else {
                stringValue = value.toString();
            }
            it("throws an exception on a falsy condition - " + typeof value + " (" + stringValue + ")", function () {
                var exceptionCaught;
                try {
                    gpf.assert(value, "It fails");
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(undefined !== exceptionCaught);
            });
        });

    });

    describe("gpf.asserts", function () {

        it("works with a message / boolean dictionary", function () {
            gpf.asserts({
                "It works": true,
                "It also works": true
            });
        });

        it("fails on first falsy", function () {
            var exceptionCaught;
            try {
                gpf.asserts({
                    "It works": true,
                    "It fails": false
                });
            } catch (e) {
                exceptionCaught = e;
            }
            assert(undefined !== exceptionCaught);
        });

    });

});
