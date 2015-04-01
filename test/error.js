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
                throw gpf.Error.InterfaceExpected({
                    name: "Test"
                });
            } catch (e) {
                assert(e instanceof gpf.Error);
                assert(e.code === gpf.Error.CODE_INTERFACEEXPECTED);
                assert(e.code === gpf.Error.InterfaceExpected.CODE);
                assert(e.name === "InterfaceExpected");
                assert(e.message
                    === "Expected interface not implemented: Test");
            }
        });

    });

});