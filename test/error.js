"use strict";
/*global describe, it, assert*/

describe("error", function () {

    describe("gpf.Error", function () {

        it("is used as an exception", function () {
            try {
                throw gpf.Error.Abstract();
            } catch (e) {
                assert(e instanceof gpf.Error);
                assert(e.constructor === gpf.Error);
            }
        });

        it("is documented", function () {
            try {
                throw gpf.Error.Abstract();
            } catch (e) {
                assert(e.code === gpf.Error.CODE_ABSTRACT);
                assert(e.code === gpf.Error.Abstract.CODE);
                assert(e.name === "Abstract");
                assert(e.message === "Abstract");
            }
        });

        it("can use substitution for message", function () {
            try {
                throw gpf.Error.AssertionFailed({
                    message: "Test"
                });
            } catch (e) {
                assert(e instanceof gpf.Error);
                assert(e.code === gpf.Error.CODE_ASSERTIONFAILED);
                assert(e.code === gpf.Error.AssertionFailed.CODE);
                assert(e.name === "AssertionFailed");
                assert(e.message === "Assertion failed: Test");
            }
        });

    });

});
