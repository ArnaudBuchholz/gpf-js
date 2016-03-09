"use strict";

describe("events", function () {

    describe("gpf.events.EVENT_xxx", function () {
        [ // expected list of known events
            "ERROR",
            "READY",
            "DATA",
            "END_OF_DATA",
            "CONTINUE",
            "STOP",
            "STOPPED"
        ].forEach(function (eventName) {
            it("declares gpf.events.EVENT_" + eventName, function () {
                assert(undefined !== gpf.events["EVENT_" + eventName]);
            });
        });
    });

    describe("gpf.events.Event", function () {

        it("has a correct class structure", function () {
            var event = new gpf.events.Event("test");
            assert(event instanceof gpf.events.Event);
            assert(event.constructor === gpf.events.Event);
        });

        it("should expose type and a default scope", function () {
            var event = new gpf.events.Event("test");
            assert("test" === event.type);
            assert(event.scope === gpf.context());
        });

        it("should transmit parameters", function () {
            var now = new Date(),
                event = new gpf.events.Event("test", {
                    string: "Hello world!",
                    number: 123,
                    "boolean": true,
                    object: now
                });
            assert("test" === event.type);
            assert("Hello world!" === event.get("string"));
            assert(123 === event.get("number"));
            assert(true === event.get("boolean"));
            assert(now === event.get("object"));
            assert(event.scope === gpf.context());
        });

        it("should allow a custom event scope", function () {
            var scope = {},
                now = new Date(),
                event = new gpf.events.Event("test", {
                    string: "Hello world!",
                    number: 123,
                    "boolean": true,
                    object: now
                }, scope);
            assert("test" === event.type);
            assert("Hello world!" === event.get("string"));
            assert(123 === event.get("number"));
            assert(true === event.get("boolean"));
            assert(now === event.get("object"));
            assert(event.scope === scope);
        });

    });

    describe("gpf.events.fire", function () {

        var receivedEvent,
            receivedScope,
            expectedScope;

        function clean () {
            receivedEvent = null;
            receivedScope = null;
        }

        function generateTestCases (eventHandler) {

            it("triggers the handler", function (done) {
                clean();
                gpf.events.fire("test", eventHandler)
                    .then(function (event) {
                        assert(event === receivedEvent);
                        assert("test" === receivedEvent.type);
                        assert(expectedScope || gpf.context() === receivedScope);
                        assert(expectedScope || gpf.context() === receivedEvent.scope);
                        done();
                    })["catch"](function (reason) {
                        done(reason);
                    });
            });

            it("triggers the handler using the event scope", function (done) {
                var scope = {};
                gpf.events.fire.call(scope, "test", eventHandler)
                    .then(function (event) {
                        assert(event === receivedEvent);
                        assert("test" === receivedEvent.type);
                        assert(expectedScope || scope === receivedScope);
                        assert(expectedScope || scope === receivedEvent.scope);
                        done();
                    })["catch"](function (reason) {
                        done(reason);
                    });
            });

            it("triggers the handler using only the event scope", function (done) {
                var scope1 = {},
                    scope2 = {},
                    eventObj = new gpf.events.Event("test", {}, scope1);
                assert(scope1 !== scope2);
                assert(eventObj.scope === scope1);
                gpf.events.fire.call(scope2, eventObj, eventHandler)
                    .then(function (event) {
                        assert(event === receivedEvent);
                        assert("test" === receivedEvent.type);
                        assert(expectedScope || scope1 === receivedScope);
                        assert(expectedScope || scope1 === receivedEvent.scope);
                        done();
                    })["catch"](function (reason) {
                        done(reason);
                    });
            });

        }

        describe("on a function", function () {

            generateTestCases(function (event) {
                receivedEvent = event;
                receivedScope = this; //eslint-disable-line consistent-this, no-invalid-this
            });

        });

        describe("on an function dictionary", function () {

            var dictionary = {
                error: function (/*event*/) {
                    assert(false);
                },
                test: function (event) {
                    receivedEvent = event;
                    receivedScope = this; //eslint-disable-line consistent-this
                }
            };

            before(function () {
                expectedScope = dictionary;
            });

            generateTestCases(dictionary);

            after(function () {
                expectedScope = undefined;
            });

        });

        describe("on an function dictionary with a specific scope", function () {

            var dictionaryScope = {},
                dictionary = {
                    error: function (/*event*/) {
                        assert(false);
                    },
                    test: function (event) {
                        receivedEvent = event;
                        receivedScope = this; //eslint-disable-line consistent-this
                    }
                };

            before(function () {
                expectedScope = dictionaryScope;
            });

            generateTestCases(dictionary);

            after(function () {
                expectedScope = undefined;
            });

        });

        describe("on an function dictionary's default method", function () {

            var dictionary = {
                error: function (/*event*/) {
                    assert(false);
                },
                test2: function (/*event*/) {
                    assert(false);
                },
                tes: function (/*event*/) {
                    assert(false);
                },
                "*": function (event) {
                    receivedEvent = event;
                    receivedScope = this; //eslint-disable-line consistent-this
                }
            };

            before(function () {
                expectedScope = dictionary;
            });

            generateTestCases(dictionary);

            after(function () {
                expectedScope = undefined;
            });

        });

        describe("on a dispatcher-like object", function () {

            var dictionary = {
                dispatchEvent: function (event) {
                    receivedEvent = event;
                    receivedScope = this; //eslint-disable-line consistent-this
                }
            };

            before(function () {
                expectedScope = dictionary;
            });

            generateTestCases(dictionary);

            after(function () {
                expectedScope = undefined;
            });

        });

        it("triggers nothing on a non matching dictionary", function (done) {
            var triggered = false;
            gpf.events.fire("test", {
                any: function (/*event*/) {
                    triggered = true;
                }
            })
                .then(function (event) {
                    assert("test" === event.type);
                    assert(gpf.context() === event.scope);
                    assert(false === triggered);
                    done();
                })["catch"](function (reason) {
                    done(reason);
                });
        });

        it("supports triggering from the event", function (done) {
            var event = new gpf.events.Event("test");
            event.fire({
                test: function (/*event*/) {
                    assert("test" === event.type);
                    assert(gpf.context() === event.scope);
                    done();
                }
            })["catch"](function (reason) {
                done(reason);
            });
        });

        it("defers recursive calls to limit the stack usage", function (done) {
            var inCall = false,
                depth = 0;
            function handler (event) {
                try {
                    if (inCall) {
                        done();
                        return; // enough
                    }
                    assert(100 > depth);
                    ++depth;
                    inCall = true;
                    gpf.events.fire("test", handler);
                    inCall = false;
                } catch (e) {
                    done(e);
                }
                return event;
            }
            handler();
        });

    });

    describe("gpf.events.isValidHandler", function () {

        [{
            label: "allows function with one parameter",
            param: function (event) {
                return event;
            },
            result: true
        }, {
            label: "rejects functions with no parameter",
            param: function () {
            },
            result: false
        }, {
            label: "rejects functions with more than one parameter",
            param: function (a, b) {
                return a + b;
            },
            result: false
        }, {
            label: "allows object with a valid dispatchEvent method",
            param: {
                dispatchEvent: function (event) {
                    return event;
                }
            },
            result: true
        }, {
            label: "rejects object with an invalid dispatchEvent method",
            param: {
                dispatchEvent: function () {
                }
            },
            result: false
        }, {
            label: "allows object mapping any event (even none)",
            param: {
            },
            result: true
        }, {
            label: "rejects unexpected types (bool)",
            param: false,
            result: false
        }, {
            label: "rejects unexpected types (number)",
            param: 1,
            result: false
        }, {
            label: "rejects unexpected types (string)",
            param: "hello world!",
            result: false
        }].forEach(function (test) {
            it(test.label, function () {
                assert(test.result === gpf.events.isValidHandler(test.param));
            });
        });

    });

    describe("gpf.events.getPromiseHandler", function () {

        it("converts an event handler function into a promise", function (done) {
            gpf.events.getPromiseHandler(function (eventHandler) {
                gpf.events.fire("test", eventHandler);
            })
                .then(function (event) {
                    assert("test" === event.type);
                    assert(gpf.context() === event.scope);
                    done();
                })["catch"](function (reason) {
                    done(reason);
                });
        });

        it("rejects error events and provides the reason", function (done) {
            gpf.events.getPromiseHandler(function (eventHandler) {
                gpf.events.fire("error", {error: "KO!"}, eventHandler);
            })
                .then(function (/*event*/) {
                    done("Not expected");

                })["catch"](function (reason) {
                    try {
                        assert("KO!" === reason);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
        });

    });

});
