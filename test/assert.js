"use strict";

describe("assert", function () {

    describe("gpf.assert", function () {

        it("does not accept no message", function () {
            var exceptionCaught;
            try {
                if (console.expects) {
                    console.expects("warn", /.*/);
                }
                gpf.assert(true);
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.AssertionFailed);
        });

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
            if (undefined === value) {
                stringValue = "undefined";
            } else if (value === null) {
                stringValue = "null";
            } else {
                stringValue = value.toString();
            }
            it("throws an exception on a falsy condition - " + typeof value + " (" + stringValue + ")", function () {
                var exceptionCaught;
                try {
                    if (console.expects) {
                        console.expects("warn", /.*/);
                    }
                    gpf.assert(value, "It fails");
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.AssertionFailed);
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
                if (console.expects) {
                    console.expects("warn", /.*/);
                }
                gpf.asserts({
                    "It works": true,
                    "It fails": false
                });
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.AssertionFailed);
        });

    });

    describe("gpf.preventAssertWarnings", function () {

        it("prevents assertion warnings", function () {
            gpf.preventAssertWarnings(true);
            var exceptionCaught;
            try {
                gpf.assert(false, "It fails");
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.AssertionFailed);
            gpf.preventAssertWarnings(false);
        });

    });

});
