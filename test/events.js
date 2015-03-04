"use strict";
/*global describe, it, assert*/

describe("events", function () {

    describe("gpf.events.Event", function () {

        it("should expose type and a default scope", function () {
            var event = new gpf.events.Event("test");
            assert.equal(event.type, "test");
            assert.ok(event.scope === gpf.context());
        });

        it("should transmit parameters", function () {
            var now = new Date(),
                event = new gpf.events.Event("test", {
                    string: "Hello world!",
                    number: 123,
                    boolean: true,
                    object: now
                });
            assert.equal(event.type, "test");
            assert.equal(event.get("string"), "Hello world!");
            assert.equal(event.get("number"), 123);
            assert.equal(event.get("boolean"), true);
            assert.ok(event.get("object") === now);
            assert.ok(event.scope === gpf.context());
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
            assert.equal(event.type, "test");
            assert.equal(event.get("string"), "Hello world!");
            assert.equal(event.get("number"), 123);
            assert.equal(event.get("boolean"), true);
            assert.ok(event.get("object") === now);
            assert.ok(event.scope === scope);
        });

    });

    describe ("gpf.events.fire", function () {

        it("triggers any Function", function (done) {
            gpf.events.fire("test", function (event) {
                assert.equal(event.type, "test");
                assert.ok(event.scope === gpf.context());
                done();
            });
        });

        it("triggers Function using event scope", function (done) {
            var scope = {};
            gpf.events.fire.apply(scope, ["test", function (event) {
                assert.equal(event.type, "test");
                assert.ok(event.scope === scope);
                assert.ok(this === scope);
                done();
            }]);
        });

        it("triggers Function using initial event scope", function (done) {
            var scope1 = {},
                scope2 = {},
                event = new gpf.events.Event("test", {}, scope1);
            assert.ok(scope1 !== scope2);
            assert.ok(event.scope === scope1);
            gpf.events.fire.apply(scope2, [event, function (event) {
                assert.equal(event.type, "test");
                assert.ok(event.scope === scope1);
                assert.ok(this === scope1);
                done();
            }]);
        });

        it("triggers Object method", function (done) {
            var scope = {
                fail: function (/*event*/) {
                    assert.ok(false);
                },
                test: function (event) {
                    assert.equal(event.type, "test");
                    assert.ok(event.scope === gpf.context());
                    assert.ok(this === scope);
                    done();
                }
            };
            gpf.events.fire("test", scope);
        });

        it("triggers Object method using object scope", function (done) {
            var scope1 = {},
                scope2 = {
                fail: function (/*event*/) {
                    assert.ok(false);
                },
                test: function (event) {
                    assert.equal(event.type, "test");
                    assert.ok(event.scope === scope1);
                    assert.ok(this === scope2);
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
                        assert.ok(false);
                    },
                    test: function (event) {
                        assert.equal(event.type, "test");
                        assert.ok(event.scope === scope1);
                        assert.ok(this === scope2);
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
                        assert.ok(false);
                    },
                    "*": function (event) {
                        assert.equal(event.type, "test");
                        assert.ok(event.scope === scope1);
                        assert.ok(this === scope2);
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
                        assert.ok(false);
                    },
                    "*": function (/*event*/) {
                        assert.ok(false);
                    },
                    test: function (event) {
                        assert.equal(event.type, "test");
                        assert.ok(event.scope === scope1);
                        assert.ok(this === scope2);
                        done();
                    },
                    scope: scope2
                };
            gpf.events.fire.apply(scope1, ["test", scope3]);
        });

        it("defers sequential calls to limit stack usage");

    });

});

