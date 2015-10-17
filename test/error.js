"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

describe("error", function () {

    describe("gpf.Error", function () {

        it("is used as an exception", function () {
            try {
                throw gpf.Error.abstract();
            } catch (e) {
                assert(e instanceof gpf.Error);
                assert(e.constructor === gpf.Error);
            }
        });

        it("is documented", function () {
            try {
                throw gpf.Error.abstract();
            } catch (e) {
                assert(e.code === gpf.Error.CODE_ABSTRACT);
                assert(e.code === gpf.Error.abstract.CODE);
                assert(e.name === "abstract");
                assert(e.message === "Abstract");
            }
        });

        it("can use substitution for message", function () {
            try {
                throw gpf.Error.assertionFailed({
                    message: "Test"
                });
            } catch (e) {
                assert(e instanceof gpf.Error);
                assert(e.code === gpf.Error.CODE_ASSERTIONFAILED);
                assert(e.code === gpf.Error.assertionFailed.CODE);
                assert(e.name === "assertionFailed");
                assert(e.message === "Assertion failed: Test");
            }
        });

    });

});
