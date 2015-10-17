"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

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
                    boolean: true,
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
                    boolean: true,
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

    describe ("gpf.events.fire", function () {

        it("triggers any Function", function (done) {
            gpf.events.fire("test", function (event) {
                assert("test" === event.type);
                assert(event.scope === gpf.context());
                done();
            });
        });

        it("triggers Function using event scope", function (done) {
            var scope = {};
            gpf.events.fire.apply(scope, ["test", function (event) {
                assert("test" === event.type);
                assert(event.scope === scope);
                assert(this === scope); //eslint-disable-line no-invalid-this
                done();
            }]);
        });

        it("triggers Function using initial event scope", function (done) {
            var scope1 = {},
                scope2 = {},
                eventObj = new gpf.events.Event("test", {}, scope1);
            assert(scope1 !== scope2);
            assert(eventObj.scope === scope1);
            gpf.events.fire.apply(scope2, [eventObj, function (event) {
                assert("test" === event.type);
                assert(event.scope === scope1);
                assert(this === scope1);  //eslint-disable-line no-invalid-this
                done();
            }]);
        });

        it("triggers Object method", function (done) {
            var scope = {
                fail: function (/*event*/) {
                    assert(false);
                },
                test: function (event) {
                    assert("test" === event.type);
                    assert(event.scope === gpf.context());
                    assert(this === scope);
                    done();
                }
            };
            gpf.events.fire("test", scope);
        });

        it("triggers Object method using object scope", function (done) {
            var scope1 = {},
                scope2 = {
                    fail: function (/*event*/) {
                        assert(false);
                    },
                    test: function (event) {
                        assert("test" === event.type);
                        assert(event.scope === scope1);
                        assert(this === scope2);
                        done();
                    }
                };
            gpf.events.fire.apply(scope1, ["test", scope2]);
        });

        it("triggers Object method using scope member", function (done) {
            var scope1 = {},
                scope2 = {},
                scope3 = {
                    fail: function (/*event*/) {
                        assert(false);
                    },
                    test: function (event) {
                        assert("test" === event.type);
                        assert(event.scope === scope1);
                        assert(this === scope2);
                        done();
                    },
                    scope: scope2
                };
            gpf.events.fire.apply(scope1, ["test", scope3]);
        });

        it("triggers Object default method", function (done) {
            var scope1 = {},
                scope2 = {},
                scope3 = {
                    fail: function (/*event*/) {
                        assert(false);
                    },
                    "*": function (event) {
                        assert("test" === event.type);
                        assert(event.scope === scope1);
                        assert(this === scope2);
                        done();
                    },
                    scope: scope2
                };
            gpf.events.fire.apply(scope1, ["test", scope3]);
        });

        it("triggers Object method instead of default", function (done) {
            var scope1 = {},
                scope2 = {},
                scope3 = {
                    fail: function (/*event*/) {
                        assert(false);
                    },
                    "*": function (/*event*/) {
                        assert(false);
                    },
                    test: function (event) {
                        assert("test" === event.type);
                        assert(event.scope === scope1);
                        assert(this === scope2);
                        done();
                    },
                    scope: scope2
                };
            gpf.events.fire.apply(scope1, ["test", scope3]);
        });

        it("defers sequential calls to limit stack usage");

    });

});
