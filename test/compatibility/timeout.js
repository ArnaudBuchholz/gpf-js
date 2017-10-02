"use strict";

describe("compatibility/timeout", function () {

    function generateScenario (methods) {

        /*
            Keep in mind that the so-called fastest callback is triggered *after* the first one
            (on some environments, this time was measured to take up to 15ms).
            If this value is not big enough, this will not give enough time for the fastest to be triggered before.
        */
        var TIMER_RESOLUTION = 1, // ms - it is almost impossible to be precise under this resolution
            MAIN_TIMEOUT = 5, // ms - min recommended value is FAST_TIMEOUT + 2* TIMER_RESOLUTION
            FAST_TIMEOUT = 2; // ms

        function now () {
            return new Date().getTime();
        }

        function Timeout (delay) {
            this._start = now();
            this._delay = delay;
            this._id = methods.setTimeout(Timeout.prototype.callback.bind(this), delay);
            this._synchronous = false;
            Timeout.list.push(this);
        }

        Timeout.list = [];

        Timeout.allocate = function (delay) {
            var timeout = new Timeout(delay);
            Timeout.list.push(timeout);
            return timeout;
        };

        Timeout.prototype = {
            _start: 0,
            _delay: 0,
            _synchronous: true,
            _id: 0,
            _allowed: false,
            _triggered: false,
            _error: null,

            id: function () {
                return this._id;
            },

            callback: function () {
                try {
                    if (!this._allowed) {
                        throw new Error("Not allowed");
                    }
                    if (this._triggered) {
                        throw new Error("Already triggered");
                    }
                    this._triggered = true;
                    if (this._synchronous) {
                        throw new Error("Triggered too soon (synchronous should be false)");
                    }
                    var realDelay = now() - this._start;
                    if (realDelay < this._delay && this._delay - realDelay > TIMER_RESOLUTION) {
                        throw new Error("Triggered too soon (" + realDelay + " does not respect the timeout delay of "
                            + this._delay + ")");
                    }
                } catch (e) {
                    this._error = e;
                }
            },

            clear: function () {
                methods.cleanTimeout(this._id);
                delete this._allowed;
            },

            clean: function () {
                if (!this._triggered) {
                    this.clear();
                }
                var len = Timeout.list.length,
                    idx;
                for (idx = 0; idx < len; ++idx) {
                    if (Timeout.list[idx] === this) {
                        break;
                    }
                }
                Timeout.list.splice(idx, 1);
            }

        };

        return function () {

            var firstTimeout;

            before(function () {
                Timeout.list = [];
            });

            beforeEach(function () {
                firstTimeout = Timeout.allocate(MAIN_TIMEOUT);
                assert(Timeout.list.length === 1);
            });

            it("allocates a timeout id", function () {
                assert(undefined !== firstTimeout.id());
            });

            afterEach(function () {
                firstTimeout.clean();
                assert(Timeout.list.length === 0);
            });

            describe("clearing", function () {

                beforeEach(function () {
                    firstTimeout.clear();
                });

                it("removes the callback from the queue", function () {
                    methods.handleTimeout(); // Should not trigger any callback
                });

                describe("again", function () {

                    beforeEach(function () {
                        firstTimeout.clear();
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
                    assert(-1 !== triggeredIds.indexOf(timeoutId));
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
                            assert(-1 !== triggeredIds.indexOf(timeoutId));
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
                        assert(-1 !== triggeredIds.indexOf(fasterTimeoutId));
                        assert(-1 !== triggeredIds.indexOf(timeoutId));
                    });

                    it("removed all callbacks from the queue", function () {
                        methods.handleTimeout(); // Should not trigger any callback
                    });

                });

            });

        };

    }

    describe("exposed API", generateScenario({

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

            setTimeout: gpf.internals._gpSetTimeoutPolyfill,
            clearTimeout: gpf.internals._gpfClearTimeoutPolyfill,
            handleTimeout: gpf.internals._gpfHandleTimeout

        }));

    }

});
