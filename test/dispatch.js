"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

/*eslint-disable max-nested-callbacks*/

describe("dispatch", function () {

    var dispatcher;

    describe("gpf.mixins.EventDispatcher", function () {

        beforeEach(function () {
            // Create a new object
            dispatcher = {};
            // Extend it to support the EventDispatcher methods
            gpf.extend(dispatcher, gpf.mixins.EventDispatcher);
        });

        it("exposes addEventListener method", function () {
            assert("function" === typeof dispatcher.addEventListener);
            assert(2 === dispatcher.addEventListener.length);
        });

        it("exposes removeEventListener method", function () {
            assert("function" === typeof dispatcher.removeEventListener);
            assert(2 === dispatcher.removeEventListener.length);
        });

        describe("without registering the event", function () {

            it("triggers no call", function () {
                dispatcher.dispatchEvent("test");
            });

            it("doesn't fail if removing an unknown listener (event matching)", function () {
                dispatcher.removeEventListener("test", function () {
                });
            });

        });

        describe("after registering a listener", function () {

            function eventHandler (event) {
                var done;
                assert(event.type === "test");
                assert(event.scope === dispatcher);
                assert(event.get("param1") === "first");
                assert(event.get("param2") === true);
                assert(event.get("param3") === 0);
                done = event.get("done");
                assert(done);
                done();
            }

            function eventHandler2 (event) {
                var done;
                assert(event.type === "test2");
                assert(event.get("expected"));
                assert(event.scope === dispatcher);
                done = event.get("done");
                assert(done);
                done();
            }

            beforeEach(function () {
                dispatcher.addEventListener("test", eventHandler);
            });

            it("receives the event", function (done) {
                dispatcher.dispatchEvent("test", {
                    param1: "first",
                    param2: true,
                    param3: 0,
                    done: done
                });
            });

            it("triggers no call on unknown event", function () {
                dispatcher.dispatchEvent("test2");
            });

            it("doesn't fail if removing an unknown listener (event not matching)", function () {
                dispatcher.removeEventListener("test2", function () {
                });
            });

            it("doesn't fail if removing an unknown listener (function not matching)", function () {
                dispatcher.removeEventListener("test", function () {
                });
            });

            describe("and registering another one", function () {

                beforeEach(function () {
                    dispatcher.addEventListener("test", function () {
                        // Nothing
                    });
                    dispatcher.addEventListener("test2", eventHandler2);
                });

                it("still receives the initial event", function (done) {
                    dispatcher.dispatchEvent("test", {
                        param1: "first",
                        param2: true,
                        param3: 0,
                        done: done
                    });
                });

                it("receives the new event (gpf.events.Event version)", function (done) {
                    var test2 = new gpf.events.Event("test2", {
                        expected: true,
                        done: done
                    }, dispatcher);
                    dispatcher.dispatchEvent(test2);
                });

                describe("to finally remove it", function () {

                    beforeEach(function () {
                        dispatcher.removeEventListener("test2", eventHandler2);
                    });

                    it("ignores the last event", function (done) {
                        dispatcher.dispatchEvent("test2", {
                            expected: false,
                            done: done
                        });
                        // Use promise to know when the event is thrown
                        done();
                    });

                    it("still receives the initial event", function (done) {
                        dispatcher.dispatchEvent("test", {
                            param1: "first",
                            param2: true,
                            param3: 0,
                            done: done
                        });
                    });

                });

            });

        });

    });

});
