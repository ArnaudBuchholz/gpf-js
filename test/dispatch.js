"use strict";
/*global describe, it, assert, beforeEach*/

describe("dispatch", function () {

    var
        dispatcher;

    describe("gpf.events.EventDispatcherImpl", function () {

        beforeEach(function () {
            // Create a new object
            dispatcher = {};
            // Extend it to support the EventDispatcher methods
            gpf.extend(dispatcher, gpf.events.EventDispatcherImpl);
        });

        it("exposes addEventListener method", function () {
            assert("function" === typeof dispatcher.addEventListener);
            assert(3 === dispatcher.addEventListener.length);
        });

        it("exposes removeEventListener method", function () {
            assert("function" === typeof dispatcher.removeEventListener);
            assert(2 === dispatcher.removeEventListener.length);
        });

        describe("without registering the event", function () {

            it("no call is triggered", function () {
                dispatcher._dispatchEvent("test");
            });

        });

        describe("after registering the event type", function () {

            var
                _done;

            function eventHandler(event) {
                assert(event.type === "test");
                assert(event.scope === dispatcher);
                assert(event.get("param1") === "first");
                assert(event.get("param2") === true);
                assert(event.get("param3") === 0);
                assert(_done);
                _done();
            }

            beforeEach(function () {
                dispatcher.addEventListener("test", eventHandler);
            });

            it("receives the correct event", function (done) {
                _done = done;
                dispatcher._dispatchEvent("test", {
                    param1: "first",
                    param2: true,
                    param3: 0
                });
            });

        })

    });

});
/*
gpf.declareTests({

    "target": [

        function (test) {
            test.title("Testing Target base class no predefined events");
            var scope1 = {},
                target = new gpf.events.Target(),
                event = new gpf.events.Event("test", {
                    param1: "first",
                    param2: true,
                    param3: 0
                }, true, scope1);
            target.addEventListener("test", function (event) {
                test.equal(this, target, "Callback scope");
                test.equal(event.type(), "test", "Event type");
                test.equal(event.get("param1"), "first", "First parameter");
                test.equal(event.get("param2"), true, "Second parameter");
                test.equal(event.get("param3"), 0, "Third parameter");
                test.equal(event.scope(), scope1, "Event scope");
                test.done();
            }, false);
            test.wait();
            event.fire(target);
        },

        function (test) {
            test.title("Testing Target base class with predefined events");
            var target = new gpf.events.Target(["test"]),
                event = new gpf.events.Event("test", {
                    param1: "first",
                    param2: true,
                    param3: 0
                }, true);
            target.onTest(function (event) {
                test.equal(event.type(), "test", "Event type");
                test.log("Stopping propagation");
                event.stopPropagation();
                test.done();
            });
            target.addEventListener("test", function () {
                test.assert(false, "Should never be called");
            });
            test.wait();
            event.fire(target);
        }

    ],

    "fire": [

        function (test) {
            test.title("Fire on a target");
            var target = new gpf.events.Target(["test"]);
            target.onTest(function (event) {
                test.equal(event.type(), "test", "Event type");
                test.done();
            });
            test.wait();
            gpf.events.fire("test", target);
        },

        function (test) {
            test.title("Fire on a Callback");
            var callback = new gpf.Callback(function (event) {
                test.equal(event.type(), "test", "Event type");
                test.done();
            });
            test.wait();
            gpf.events.fire("test", callback);
        },

        function (test) {
            test.title("Fire on a Function");
            test.wait();
            gpf.events.fire("test", function (event) {
                test.equal(event.type(), "test", "Event type");
                test.done();
            });
        },

        function (test) {
            test.title("Fire on a Object");
            test.wait();
            gpf.events.fire("test", {

                test: function (event) {
                    test.equal(event.type(), "test", "Event type");
                    test.done();
                }

            });
        }
    ]

});
*/