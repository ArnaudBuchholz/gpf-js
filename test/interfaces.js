"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

describe("interfaces", function () {

    var
        gpfIEventDispatcher = gpf.interfaces.IEventDispatcher,
        SampleEventDispatcherWithAddOnly = function () {},
        SampleEventDispatcherComplete = function () {},
        fakeAddEventListener = function (a, b) {
            assert(a);
            assert(b);
            return this;
        },
        fakeRemoveEventListener = function (a, b) {
            assert(a);
            assert(b);
            return this;
        },
        fakeDispatchEvent = function (a, b) {
            assert(a);
            assert(b);
            return null;
        };

    SampleEventDispatcherWithAddOnly.prototype = {
        addEventListener: fakeAddEventListener
    };

    SampleEventDispatcherComplete.prototype = new SampleEventDispatcherWithAddOnly();
    SampleEventDispatcherComplete.prototype.removeEventListener = fakeRemoveEventListener;
    SampleEventDispatcherComplete.prototype.dispatchEvent = fakeDispatchEvent;

    describe("gpf.interfaces.isImplementedBy", function () {

        it("verifies that an object implements an interface", function () {
            var test = {
                addEventListener: fakeAddEventListener,
                removeEventListener: fakeRemoveEventListener,
                dispatchEvent: fakeDispatchEvent
            };
            assert(true === gpf.interfaces.isImplementedBy(test, gpfIEventDispatcher));
        });

        it("checks function signatures", function () {
            var test = {
                addEventListener: function (a, b) {
                    return a + b;
                },
                removeEventListener: fakeRemoveEventListener
            };
            assert(false === gpf.interfaces.isImplementedBy(test, gpfIEventDispatcher));
        });

        it("works through inheritance", function () {
            assert(true === gpf.interfaces.isImplementedBy(new SampleEventDispatcherComplete(), gpfIEventDispatcher));
        });

        it("works with classes", function () {
            assert(true === gpf.interfaces.isImplementedBy(SampleEventDispatcherComplete, gpfIEventDispatcher));
        });

    });

    describe("gpf.interfaces.query", function () {

        it("generates an error if interface not available", function () {
            var caught;
            try {
                gpf.interfaces.query({}, gpfIEventDispatcher);
            } catch (e) {
                caught = e;
            }
            assert(null !== caught);
            assert(caught.code === gpf.Error.CODE_INTERFACEEXPECTED);
            assert(caught.code === gpf.Error.InterfaceExpected.CODE);
            assert(caught.name === "InterfaceExpected");
            assert(caught.message === "Expected interface not implemented: gpf.interfaces.IEventDispatcher");
        });

        it("can also just return null if interface not available", function () {
            assert(null === gpf.interfaces.query({}, gpfIEventDispatcher, false));
        });

        it("retrieves an object for the expected interface", function () {
            var instance = new SampleEventDispatcherComplete(),
                iEventDispatcher = gpf.interfaces.query(instance, gpfIEventDispatcher, false);
            assert(null !== iEventDispatcher);
            assert(instance === iEventDispatcher);
            assert(true === gpf.interfaces.isImplementedBy(iEventDispatcher, gpfIEventDispatcher));
        });

    });

    describe("IUnknown", function () {

        var SampleBuilder = function () {};
        SampleBuilder.prototype.queryInterface = function (iDefinition) {
            if (gpfIEventDispatcher === iDefinition) {
                return new SampleEventDispatcherComplete();
            }
            return null;
        };

        it("exposes queryInterface", function () {
            assert(true === gpf.interfaces.isImplementedBy(SampleBuilder, gpf.interfaces.IUnknown));
        });

        it("is used by gpf.interfaces.query", function () {
            var instance = new SampleBuilder(),
                iEventDispatcher = gpf.interfaces.query(instance, gpfIEventDispatcher, false);
            assert(null !== iEventDispatcher);
            assert(true === gpf.interfaces.isImplementedBy(iEventDispatcher, gpfIEventDispatcher));
        });

    });

    describe("$InterfaceImplement", function () {

        describe("member name", function () {

            var SampleBuilder = gpf.define("SampleBuilder", {
                    "[Class]": [gpf.$InterfaceImplement(gpfIEventDispatcher, "_getAswEventDispatcher")],
                    private: {
                        _getAswEventDispatcher: function () {
                            return new SampleEventDispatcherComplete();
                        }
                    }
                });

            it("exposes queryInterface", function () {
                assert(true === gpf.interfaces.isImplementedBy(SampleBuilder, gpf.interfaces.IUnknown));
            });

            it("is used by gpf.interfaces.query", function () {
                var instance = new SampleBuilder(),
                    iEventDispatcher = gpf.interfaces.query(instance, gpfIEventDispatcher, false);
                assert(null !== iEventDispatcher);
                assert(true === gpf.interfaces.isImplementedBy(iEventDispatcher, gpfIEventDispatcher));
            });

        });

        describe("builder function", function () {

            var _getAswEventDispatcher = function (that) {
                    assert(null !== that);
                    return new SampleEventDispatcherComplete();
                },
                SampleBuilder = gpf.define("SampleBuilder", {
                    "[Class]": [gpf.$InterfaceImplement(gpfIEventDispatcher, _getAswEventDispatcher)]
                });

            it("exposes queryInterface", function () {
                assert(true === gpf.interfaces.isImplementedBy(SampleBuilder, gpf.interfaces.IUnknown));
            });

            it("is used by gpf.interfaces.query", function () {
                var instance = new SampleBuilder(),
                    iEventDispatcher = gpf.interfaces.query(instance, gpfIEventDispatcher, false);
                assert(null !== iEventDispatcher);
                assert(true === gpf.interfaces.isImplementedBy(iEventDispatcher, gpfIEventDispatcher));
            });

        });

    });

});
