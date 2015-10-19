"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

describe("error", function () {

    describe("gpf.Error", function () {

        it("is used as an exception", function () {
            try {
                throw gpf.Error.abstractMethod();
            } catch (e) {
                assert(e instanceof gpf.Error);
                assert(e.constructor === gpf.Error);
            }
        });

        it("is documented", function () {
            try {
                throw gpf.Error.abstractMethod();
            } catch (e) {
                assert(e.code === gpf.Error.CODE_ABSTRACTMETHOD);
                assert(e.code === gpf.Error.abstractMethod.CODE);
                assert(e.name === "abstractMethod");
                assert(e.message === "Abstract method");
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
