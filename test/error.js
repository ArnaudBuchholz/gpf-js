"use strict";

describe("error", function () {

    describe("gpf.Error", function () {

        it("is used as an exception", function () {
            var exceptionCaught;
            try {
                gpf.Error.abstractMethod();
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof Error); // Standard since JavaScript 1.1
            assert(exceptionCaught instanceof gpf.Error);
            assert(exceptionCaught instanceof gpf.Error.AbstractMethod);
            assert(exceptionCaught.constructor === gpf.Error.AbstractMethod);
        });

        it("is documented", function () {
            var exceptionCaught;
            try {
                gpf.Error.abstractMethod();
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught.code === gpf.Error.CODE_ABSTRACTMETHOD);
            assert(exceptionCaught.code === gpf.Error.abstractMethod.CODE);
            assert(exceptionCaught.name === "abstractMethod");
            assert(exceptionCaught.message === "Abstract method");
        });

        it("can use substitution for message", function () {
            var exceptionCaught;
            try {
                gpf.Error.assertionFailed({
                    message: "Test"
                });
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.AssertionFailed);
            assert(exceptionCaught.code === gpf.Error.CODE_ASSERTIONFAILED);
            assert(exceptionCaught.code === gpf.Error.assertionFailed.CODE);
            assert(exceptionCaught.name === "assertionFailed");
            assert(exceptionCaught.message === "Assertion failed: Test");
        });

    });

});
