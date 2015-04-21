"use strict";
/*global describe, it, assert*/

describe("interfaces", function () {

    describe("gpf.interfaces.isImplementedBy", function () {

        it("verifies that an object implements an interface", function () {
            var test = {
                addEventListener: function (a, b, c) {
                    return a + b +c;
                },

                removeEventListener: function (a, b) {
                    return a + b;
                }
            };
            assert(true === gpf.interfaces.isImplementedBy(test,
                gpf.interfaces.IEventDispatcher));
        });

        it("checks function signatures", function () {
            var test = {
                addEventListener: function (a, b) {
                    return a + b;
                },

                removeEventListener: function (a, b) {
                    return a + b;
                }
            };
            assert(false === gpf.interfaces.isImplementedBy(test,
                gpf.interfaces.IEventDispatcher));
        });

        it("works through inheritance", function () {
            var
                testAddOnly = {
                    addEventListener: function (a, b, c) {
                        return a + b + c;
                    }
                },
                TestWithRemove = function () {
                },
                testWithRemove;
            TestWithRemove.prototype = testAddOnly;
            TestWithRemove.prototype.removeEventListener = function (a, b) {
                return a + b;
            };
            testWithRemove = new TestWithRemove();
            assert(true === gpf.interfaces.isImplementedBy(testWithRemove,
                gpf.interfaces.IEventDispatcher));
        });

    });

    describe("gpf.interfaces.query", function () {

        it("generates an error if interface not available", function () {
            var caught;
            try {
                gpf.interfaces.query({}, gpf.interfaces.IEventDispatcher);
            } catch (e) {
                caught = e;
            }
            assert(null !== caught);
            assert(caught.code === gpf.Error.CODE_INTERFACEEXPECTED);
            assert(caught.code === gpf.Error.InterfaceExpected.CODE);
            assert(caught.name === "InterfaceExpected");
            assert(caught.message === "Expected interface not implemented: " +
                "gpf.interfaces.IEventDispatcher");
        });

        it("can also just return null if interface not available", function () {
            assert(null === gpf.interfaces.query({},
                gpf.interfaces.IEventDispatcher, false));
        });

        it("retrieves an object implementing the expected interface");

    });

    describe("$InterfaceImplement", function () {

    });

});