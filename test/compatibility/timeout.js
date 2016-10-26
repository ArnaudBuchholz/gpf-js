"use strict";

describe("compatibility/timeout", function () {

    function generateScenario (methods) {

        return function () {

            var timeoutId,
                synchronousFlag,
                triggered,
                callbackDone,
                allowedIds = [],
                deniedIds = [];

            function callback (id) {
                assert(-1 === deniedIds.indexOf(id));
                assert(-1 < allowedIds.indexOf(id));
                assert(undefined !== callbackDone);
                assert(true === synchronousFlag);
                assert(false === triggered);
                deniedIds.push(id); // Prevent multiple executions
                synchronousFlag = false;
                triggered = true;
                callbackDone();
            }

            function clean (id) {
                if (-1 === deniedIds.indexOf(id) && -1 === allowedIds.indexOf(id)) {
                    // Not processed, cleaning
                    deniedIds.push(id);
                    methods.clearTimeout(id);
                    // no waiting, assuming this part works
                }
            }

            beforeEach(function () {
                methods.clearQueue();
                triggered = false;
                var id = methods.setTimeout(function () {
                    callback(id);
                }, 20);
                timeoutId = id;
                synchronousFlag = true;
            });

            it("allocates a timeout id", function () {
                assert(undefined !== timeoutId);
            });

            it("allows queueing a callback", function () {
                methods.testQueueLength(1);
            });

            afterEach(function () {
                clean(timeoutId);
            });

            describe("clearing", function () {

                beforeEach(function () {
                    deniedIds.push(timeoutId);
                    methods.clearTimeout(timeoutId);
                });

                it("removes the callback from the queue", function () {
                    methods.testQueueLength(0);
                });

                describe("again", function () {

                    beforeEach(function () {
                        methods.clearTimeout(timeoutId);
                    });

                    it("does not fail", function () {
                        methods.testQueueLength(0);
                    });

                });

            });

            describe("triggering", function () {

                beforeEach(function (done) {
                    allowedIds.push(timeoutId);
                    callbackDone = done;
                    methods.handleTimeout();
                });

                it("executes the callback from the queue", function () {
                    assert(true === triggered);
                });

                it("removes the callback from the queue", function () {
                    methods.testQueueLength(0);
                });

            });

            describe("sequencing with a second timeout", function () {

                var fasterTimeoutId;

                function fasterCallback (id) {
                    assert(-1 === deniedIds.indexOf(id));
                    assert(-1 < allowedIds.indexOf(id));
                    assert(undefined !== callbackDone);
                    assert(false === triggered);
                    deniedIds.push(id); // Prevent multiple executions
                    callbackDone();
                }

                beforeEach(function () {
                    var id = methods.setTimeout(function () {
                        fasterCallback(id);
                    }, 10);
                    fasterTimeoutId = id;
                });

                it("allocates a different timeout id", function () {
                    assert(undefined !== fasterTimeoutId);
                    assert(fasterTimeoutId !== timeoutId);
                });

                it("allows queueing a different callback", function () {
                    methods.testQueueLength(2);
                });

                afterEach(function () {
                    clean(fasterTimeoutId);
                });

                describe("clearing the second timeout", function () {

                    beforeEach(function () {
                        deniedIds.push(fasterTimeoutId);
                        methods.clearTimeout(fasterTimeoutId);
                    });

                    describe("triggering", function () {

                        beforeEach(function (done) {
                            allowedIds.push(timeoutId);
                            callbackDone = done;
                            methods.handleTimeout();
                        });

                        it("executes the remaining callback from the queue", function () {
                            assert(true === triggered);
                        });

                        it("removes all callbacks from the queue", function () {
                            methods.testQueueLength(0);
                        });

                    });

                    describe("again", function () {

                        beforeEach(function () {
                            methods.clearTimeout(fasterTimeoutId);
                        });

                        it("does not fail", function () {
                            methods.testQueueLength(1);
                        });

                    });

                });

                describe("triggering", function () {

                    beforeEach(function (done) {
                        allowedIds.push(fasterTimeoutId);
                        allowedIds.push(timeoutId);
                        var numberOfCalls = 0;
                        callbackDone = function () {
                            if (2 === ++numberOfCalls) {
                                done();
                            }
                        };
                        methods.handleTimeout();
                    });

                    it("executes the callbacks from the queue", function () {
                        assert(true === triggered);
                    });

                    it("removed all callbacks from the queue", function () {
                        methods.testQueueLength(0);
                    });

                });

            });

        };

    }

    describe("exposed API", generateScenario({

        clearQueue: function () {},
        testQueueLength: function () {},
        setTimeout: function (callback, delay) {
            return setTimeout(callback, delay);
        },
        clearTimeout: function (timeoutId) {
            clearTimeout(timeoutId);
        },
        handleTimeout: function () {}

    }));


    if (gpf.internals) {

        describe("(internal)", generateScenario({

            clearQueue: function () {
                gpf.internals._gpfTimeoutQueue.length = 0;
            },
            testQueueLength: function (size) {
                assert(size === gpf.internals._gpfTimeoutQueue.length);
            },
            setTimeout: gpf.internals._gpSetTimeoutPolyfill,
            clearTimeout: gpf.internals._gpfClearTimeoutPolyfill,
            handleTimeout: gpf.internals._gpfHandleTimeout

        }));

    }

});
