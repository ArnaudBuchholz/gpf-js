"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

/*eslint-disable max-nested-callbacks*/

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
            receivedScope;

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
                        assert(gpf.context() === receivedScope);
                        assert(gpf.context() === receivedEvent.scope);
                        done();
                    });
            });

            it("triggers the handler using the event scope", function (done) {
                var scope = {};
                gpf.events.fire.apply(scope, ["test", eventHandler])
                    .then(function (event) {
                        assert(event === receivedEvent);
                        assert("test" === receivedEvent.type);
                        assert(scope === receivedScope);
                        assert(scope === receivedEvent.scope);
                        done();
                    });
            });

            it("triggers the handler using only the event scope", function (done) {
                var scope1 = {},
                    scope2 = {},
                    eventObj = new gpf.events.Event("test", {}, scope1);
                assert(scope1 !== scope2);
                assert(eventObj.scope === scope1);
                gpf.events.fire.apply(scope2, [eventObj, eventHandler])
                    .then(function (event) {
                        assert(event === receivedEvent);
                        assert("test" === receivedEvent.type);
                        assert(scope1 === receivedScope);
                        assert(scope1 === receivedEvent.scope);
                        done();
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

            generateTestCases({
                error: function (/*event*/) {
                    assert(false);
                },
                test: function (event) {
                    receivedEvent = event;
                    receivedScope = this; //eslint-disable-line consistent-this
                }
            });

        });

        describe("on an function dictionary's default method", function () {

            generateTestCases({
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
            });

        });

        it("defers recursive calls to limit the stack usage", function (done) {
            var inCall = false,
                depth = 0;
            function handler (/*event*/) {
                if (inCall) {
                    done();
                }
                assert(100 > depth);
                ++depth;
                inCall = true;
                gpf.events.fire("test", handler);
                inCall = false;
            }
            handler();
        });

    });

});
