"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

/*eslint-disable max-nested-callbacks*/

describe("interfaces", function () {

    var gpfIEventDispatcher = gpf.interfaces.IEventDispatcher;

    /**
     * @this bound object
     */
    function fakeAddEventListener (a, b) {
        /*jshint validthis:true*/
        assert(a);
        assert(b);
        return this;
    }

    /**
     * @this bound object
     */
    function fakeRemoveEventListener (a, b) {
        /*jshint validthis:true*/
        assert(a);
        assert(b);
        return this;
    }

    function fakeDispatchEvent (a, b) {
        assert(a);
        assert(b);
        return null;
    }

    function SampleEventDispatcherWithAddOnly () {
    }
    SampleEventDispatcherWithAddOnly.prototype = {
        addEventListener: fakeAddEventListener
    };

    function SampleEventDispatcherComplete () {
    }
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
                addEventListener: function (a, b, c) {
                    return a + b + c;
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
            assert(caught.code === gpf.Error.interfaceExpected.CODE);
            assert(caught.name === "interfaceExpected");
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

        function SampleBuilder () {
        }
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

        describe("serves as documentation (no builder)", function () {

            var TestAttribute = gpf.define("TestAttribute", "gpf.attributes.Attribute"),
                IMyInterface = gpf.define("IMyInterface", {
                    "[myInterfaceMethod]": [new TestAttribute()],
                    myInterfaceMethod: function () {}
                }),
                SampleDispatcher = gpf.define("SampleDispatcher", {
                    "[Class]": [
                        gpf.$InterfaceImplement(gpfIEventDispatcher),
                        gpf.$InterfaceImplement(IMyInterface)
                    ],
                    "public": {

                        addEventListener: fakeAddEventListener,
                        removeEventListener: fakeRemoveEventListener,
                        dispatchEvent: fakeDispatchEvent,
                        myInterfaceMethod: function () {}

                    }
                });

            it("does not generate queryInterface", function () {
                var instance = new SampleDispatcher(),
                    iEventDispatcher = gpf.interfaces.query(instance, gpfIEventDispatcher, false);
                assert(null !== iEventDispatcher);
                assert(true === gpf.interfaces.isImplementedBy(iEventDispatcher, gpfIEventDispatcher));
                assert(undefined === instance.queryInterface);
            });

            it("forwards attributes set on the interface", function () {

            });

        });

        describe("builder as a member name", function () {

            var SampleBuilder = gpf.define("SampleBuilder", {
                "[Class]": [gpf.$InterfaceImplement(gpfIEventDispatcher, "_getAswEventDispatcher")],
                "private": {
                    _getAswEventDispatcher: function () {
                        return new SampleEventDispatcherComplete();
                    }
                }
            });

            it("exposes queryInterface (when builder is provided)", function () {
                assert(true === gpf.interfaces.isImplementedBy(SampleBuilder, gpf.interfaces.IUnknown));
            });

            it("is used by gpf.interfaces.query", function () {
                var instance = new SampleBuilder(),
                    iEventDispatcher = gpf.interfaces.query(instance, gpfIEventDispatcher, false);
                assert(null !== iEventDispatcher);
                assert(true === gpf.interfaces.isImplementedBy(iEventDispatcher, gpfIEventDispatcher));
            });

        });

        describe("builder as a standalone function", function () {

            var IMyInterface = gpf.define("IMyInterface", {
                myInterfaceMethod: function () {}
            });
            function _getAsMyInterface (that) {
                assert(null !== that);
                return {
                    myInterfaceMethod: function () {
                        return "ok";
                    }
                };
            }
            function _getAswEventDispatcher (that) {
                assert(null !== that);
                return new SampleEventDispatcherComplete();
            }
            var SampleBuilder = gpf.define("SampleBuilder", {
                "[Class]": [
                    gpf.$InterfaceImplement(gpfIEventDispatcher, _getAswEventDispatcher),
                    gpf.$InterfaceImplement(IMyInterface, _getAsMyInterface)
                ]
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

        describe("builder on top of existing queryInterface", function () {

            var IMyInterface = gpf.define("IMyInterface", {
                myInterfaceMethod: function () {}
            });
            var SampleBuilder = gpf.define("SampleBuilder", {
                "[Class]": [gpf.$InterfaceImplement(gpfIEventDispatcher, "_getAswEventDispatcher")],
                "private": {
                    _getAswEventDispatcher: function () {
                        return new SampleEventDispatcherComplete();
                    }
                },
                "public": {
                    queryInterface: function (iDefinition) {
                        if (iDefinition === gpfIEventDispatcher) {
                            assert(false);
                        } else if (iDefinition === IMyInterface) {
                            return {
                                myInterfaceMethod: function () {
                                    return "ok";
                                }
                            };
                        }
                        return null;
                    }
                }
            });

            it("wraps existing queryInterface", function () {
                var instance = new SampleBuilder(),
                    iMyInterface = gpf.interfaces.query(instance, IMyInterface, false);
                assert(null !== iMyInterface);
                assert(true === gpf.interfaces.isImplementedBy(iMyInterface, IMyInterface));
                assert("ok" === iMyInterface.myInterfaceMethod());
            });

            it("it adds declared builders", function () {
                var instance = new SampleBuilder(),
                    iEventDispatcher = gpf.interfaces.query(instance, gpfIEventDispatcher, false);
                assert(null !== iEventDispatcher);
                assert(true === gpf.interfaces.isImplementedBy(iEventDispatcher, gpfIEventDispatcher));
            });

        });

    });

});
