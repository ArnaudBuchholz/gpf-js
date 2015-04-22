"use strict";
/*global describe, it, assert*/

describe("interfaces", function () {

    var
        SampleEventDispatcherWithAddOnly = function () {},
        SampleEventDispatcherComplete = function () {},
        fakeAddEventListener = function (a, b, c) {
            a = b + c; // Just to avoid unused parameters warning
            return this;
        },
        fakeRemoveEventListener = function (a, b) {
            a = b;
            return this;
        };

    SampleEventDispatcherWithAddOnly.prototype = {

        addEventListener: fakeAddEventListener

    };

    SampleEventDispatcherComplete.prototype
        = new SampleEventDispatcherWithAddOnly();

    SampleEventDispatcherComplete.prototype.removeEventListener
        = fakeRemoveEventListener;

    describe("gpf.interfaces.isImplementedBy", function () {

        it("verifies that an object implements an interface", function () {
            var test = {
                addEventListener: fakeAddEventListener,
                removeEventListener: fakeRemoveEventListener
            };
            assert(true === gpf.interfaces.isImplementedBy(test,
              gpf.interfaces.IEventDispatcher));
        });

        it("checks function signatures", function () {
            var test = {
                addEventListener: function (a, b) {
                    return a + b;
                },
                removeEventListener: fakeRemoveEventListener
            };
            assert(false === gpf.interfaces.isImplementedBy(test,
              gpf.interfaces.IEventDispatcher));
        });

        it("works through inheritance", function () {
            assert(true === gpf.interfaces.isImplementedBy(
              new SampleEventDispatcherComplete(),
              gpf.interfaces.IEventDispatcher));
        });

        it("works with classes", function () {
            assert(true === gpf.interfaces.isImplementedBy(
              SampleEventDispatcherComplete,
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