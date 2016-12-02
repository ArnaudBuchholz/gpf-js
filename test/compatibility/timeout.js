"use strict";

describe("compatibility/timeout", function () {

    function generateScenario (methods) {

        /*
            Keep in mind that the so-called fastest callback is triggered *after* the first one
            (on some environments, this time was measured to take up to 15ms).
            If this value is not big enough, this will not give enough time for the fastest to be triggered before.
        */
        var TIMER_RESOLUTION = 10, // ms - it is almost impossible to be precise under this resolution
            MAIN_TIMEOUT = 50, // ms - min recommended value is FAST_TIMEOUT + 2* TIMER_RESOLUTION
            FAST_TIMEOUT = 20; // ms

        return function () {

            var timeoutId,
                timeoutDateTime,
                synchronousFlag,
                triggered,
                callbackDone,
                allowedIds = [],
                deniedIds = [];

            function _checkIfTimeoutIdAllowed (id) {
                if (-1 !== deniedIds.indexOf(id)) {
                    throw new Error("Denied");
                }
                if (-1 === allowedIds.indexOf(id)) {
                    throw new Error("Not allowed");
                }
            }

            function _checkFlags () {
                if (triggered) {
                    throw new Error("Already triggered");
                }
                if (true !== synchronousFlag) {
                    throw new Error("Triggered too soon (synchronousFlag should be true)");
                }
            }

            function _checkDelay (startDateTime, timeoutDelay) {
                var realDelay = new Date() - startDateTime;
                if (methods.checkDelay && realDelay < timeoutDelay && timeoutDelay - realDelay > TIMER_RESOLUTION) {
                    throw new Error("Triggered too soon (" + realDelay + " does not respect the timeout delay of "
                        + timeoutDelay + ")");
                }
            }

            function _callbackCommon (id, startDateTime, timeoutDelay) {
                if (undefined === callbackDone) {
                    console.error("Unexpected callback triggered when callbackDone is undefined");
                }
                _checkIfTimeoutIdAllowed(id);
                _checkFlags();
                _checkDelay(startDateTime, timeoutDelay);
                deniedIds.push(id); // Prevent multiple executions
            }

            function callback (id) {
                try {
                    _callbackCommon(id, timeoutDateTime, MAIN_TIMEOUT);
                    synchronousFlag = false;
                    triggered = true;
                    callbackDone();
                } catch (e) {
                    callbackDone(e);
                }
            }

            function _clean (id) {
                deniedIds.push(id);
                methods.clearTimeout(id);
                // no waiting, assuming this part works
            }

            function clean (id) {
                if (-1 === deniedIds.indexOf(id) && -1 === allowedIds.indexOf(id)) {
                    // Not processed, cleaning
                    _clean(id);
                }
            }

            function _scheduleCallback () {
                if (timeoutId) {
                    _clean(timeoutId);
                }
                triggered = false;
                timeoutDateTime = new Date();
                var id = methods.setTimeout(function () {
                    callback(id);
                    timeoutId = undefined;
                }, MAIN_TIMEOUT);
                timeoutId = id;
                synchronousFlag = true;
            }

            beforeEach(function () {
                _scheduleCallback();
            });

            it("allocates a timeout id", function () {
                assert(undefined !== timeoutId);
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
                    methods.handleTimeout(); // Should not trigger any callback
                });

                describe("again", function () {

                    beforeEach(function () {
                        methods.clearTimeout(timeoutId);
                    });

                    it("does not fail", function () {
                        methods.handleTimeout(); // Should not trigger any callback
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
                    methods.handleTimeout(); // Should not trigger any callback
                });

            });

            describe("sequencing with a second timeout", function () {

                var fasterTimeoutId,
                    fasterTimeoutDateTime;

                function fasterCallback (id) {
                    try {
                        _callbackCommon(id, fasterTimeoutDateTime, FAST_TIMEOUT);
                        callbackDone();
                    } catch (e) {
                        callbackDone(e);
                    }
                }

                beforeEach(function () {
                    fasterTimeoutDateTime = new Date();
                    /*
                     * Because the test is asynchronous, we might have already reached the main timeout,
                     * Reschedule it to make sure they both start at the same time.
                     */
                    _scheduleCallback();
                    var id = methods.setTimeout(function () {
                        fasterCallback(id);
                    }, FAST_TIMEOUT);
                    fasterTimeoutId = id;
                });

                it("allocates a different timeout id", function () {
                    assert(undefined !== fasterTimeoutId);
                    assert(fasterTimeoutId !== timeoutId);
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
                            methods.handleTimeout(); // Should not trigger any callback
                        });

                    });

                });

                function _allowTriggering (done, expectedCalls) {
                    allowedIds.push(fasterTimeoutId);
                    allowedIds.push(timeoutId);
                    var numberOfCalls = 0;
                    callbackDone = function (e) {
                        if (e) {
                            done(e);
                        } else if (expectedCalls === ++numberOfCalls) {
                            done();
                        }
                    };
                }

                describe("creating and cleaning a third timeout", function () {

                    it("prevents execution", function (done) {
                        _allowTriggering(done, 3);
                        var thirdId = methods.setTimeout(function () {
                            callbackDone(new Error("The third timeout was triggered"));
                        }, 10 * MAIN_TIMEOUT);
                        methods.clearTimeout(thirdId);
                        methods.handleTimeout();
                        callbackDone();
                    });

                });

                describe("triggering", function () {

                    beforeEach(function (done) {
                        _allowTriggering(done, 2);
                        methods.handleTimeout();
                    });

                    it("executes the callbacks from the queue", function () {
                        assert(true === triggered);
                    });

                    it("removed all callbacks from the queue", function () {
                        methods.handleTimeout(); // Should not trigger any callback
                    });

                });

            });

        };

    }

    describe("exposed API", generateScenario({

        checkDelay: true,
        setTimeout: function (callback, delay) {
            return setTimeout(callback, delay);
        },
        clearTimeout: function (timeoutId) {
            clearTimeout(timeoutId);
        },
        handleTimeout: function () {}

    }));

    if (gpf.internals && setTimeout !== gpf.internals._gpSetTimeoutPolyfill) {

        describe("(internal)", generateScenario({

            checkDelay: false,
            setTimeout: gpf.internals._gpSetTimeoutPolyfill,
            clearTimeout: gpf.internals._gpfClearTimeoutPolyfill,
            handleTimeout: gpf.internals._gpfHandleTimeout

        }));

    }

});
