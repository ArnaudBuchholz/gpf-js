"use strict";

describe("compatibility/timeout", function () {

    if (config.performance) {
        it("is not relevant for performance testing", function () {
            assert(true);
        });
        return;
    }

    function generateScenario (methods) {

        /*
            Keep in mind that the so-called fastest callback is triggered *after* the first one
            (on some environments, this time was measured to take up to 15ms).
            If this value is not big enough, this will not give enough time for the fastest to be triggered before.
        */
        var TIMER_RESOLUTION, // ms - it is almost impossible to be precise under this resolution
            FAST_TIMEOUT, // ms - min recommended value is FAST_TIMEOUT + 2* TIMER_RESOLUTION
            MAIN_TIMEOUT; // ms

        if (config.timerResolution) {
            TIMER_RESOLUTION = config.timerResolution;
        } else {
            TIMER_RESOLUTION = 1;
        }

        FAST_TIMEOUT = 2 * TIMER_RESOLUTION;
        MAIN_TIMEOUT = FAST_TIMEOUT + 2 * TIMER_RESOLUTION;

        function now () {
            return new Date().getTime();
        }

        function Timeout (delay) {
            this._start = now();
            this._delay = delay;
            this._id = methods.setTimeout(Timeout.prototype.callback.bind(this), delay);
            this._synchronous = false;
        }

        Timeout.list = [];

        Timeout.allocate = function (delay) {
            var timeout = new Timeout(delay);
            Timeout.list.push(timeout);
            return timeout;
        };

        Timeout.noError = function () {
            var len = Timeout.list.length,
                idx,
                timeout;
            for (idx = 0; idx < len; ++idx) {
                timeout = Timeout.list[idx];
                if (timeout.error()) {
                    return false;
                }
            }
            return true;
        };

        Timeout.check = function () {
            assert(Timeout.noError());
        };

        Timeout.prototype = {
            _start: 0,
            _delay: 0,
            _synchronous: true,
            _id: 0,
            _allowed: false,
            _triggered: 0,
            _error: null,
            _done: function () {},

            id: function () {
                return this._id;
            },

            _isAllowed: function () {
                if (!this._allowed) {
                    throw new Error("Not allowed");
                }
            },

            _isTriggered: function () {
                if (this._triggered) {
                    throw new Error("Already triggered");
                }
            },

            _isSynchronous: function () {
                if (this._synchronous) {
                    throw new Error("Triggered too soon (synchronous should be false)");
                }
            },

            callback: function () {
                try {
                    this._isAllowed();
                    this._isTriggered();
                    this._triggered = now();
                    this._isSynchronous();
                    var realDelay = now() - this._start;
                    if (realDelay < this._delay && this._delay - realDelay > TIMER_RESOLUTION) {
                        throw new Error("Triggered too soon (" + realDelay + " does not respect the timeout delay of "
                            + this._delay + ")");
                    }
                    this._done();
                } catch (e) {
                    this._error = e;
                    this._done(e);
                }
            },

            clear: function () {
                methods.clearTimeout(this._id);
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
            },

            error: function () {
                return this._error;
            },

            allow: function (done) {
                this._allowed = true;
                this._done = done;
            },

            triggered: function () {
                return this._triggered;
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
                Timeout.check();
            });

            it("allocates a timeout id", function () {
                assert(undefined !== firstTimeout.id());
                Timeout.check();
            });

            afterEach(function () {
                firstTimeout.clean();
                Timeout.check();
            });

            describe("clearing", function () {

                beforeEach(function () {
                    firstTimeout.clear();
                    Timeout.check();
                });

                it("removes the callback from the queue", function () {
                    methods.handleTimeout(); // Should not trigger any callback
                    Timeout.check();
                });

                describe("again", function () {

                    beforeEach(function () {
                        firstTimeout.clear();
                        Timeout.check();
                    });

                    it("does not fail", function () {
                        methods.handleTimeout(); // Should not trigger any callback
                        Timeout.check();
                    });

                });

            });

            describe("triggering", function () {

                beforeEach(function (done) {
                    firstTimeout.allow(done);
                    methods.handleTimeout();
                    Timeout.check();
                });

                it("executes the callback from the queue", function () {
                    assert(firstTimeout.triggered);
                    Timeout.check();
                });

                it("removes the callback from the queue", function () {
                    methods.handleTimeout(); // Should not trigger any callback
                    Timeout.check();
                });

            });

            describe("sequencing with a second timeout", function () {

                var fasterTimeout;

                beforeEach(function () {
                    firstTimeout.clean();
                    fasterTimeout = Timeout.allocate(FAST_TIMEOUT);
                    firstTimeout = Timeout.allocate(MAIN_TIMEOUT);
                    Timeout.check();
                });

                it("allocates a different timeout id", function () {
                    assert(undefined !== fasterTimeout.id());
                    assert(fasterTimeout.id() !== firstTimeout.id());
                    Timeout.check();
                });

                afterEach(function () {
                    fasterTimeout.clean();
                    Timeout.check();
                });

                describe("clearing the second timeout", function () {

                    beforeEach(function () {
                        fasterTimeout.clear();
                        Timeout.check();
                    });

                    describe("triggering", function () {

                        beforeEach(function (done) {
                            firstTimeout.allow(done);
                            methods.handleTimeout(); // Should trigger callback
                            Timeout.check();
                        });

                        it("executes the remaining callback from the queue", function () {
                            assert(firstTimeout.triggered());
                            Timeout.check();
                        });

                        it("removes all callbacks from the queue", function () {
                            methods.handleTimeout(); // Should not trigger any callback
                            Timeout.check();
                        });

                    });

                });

                function _doneMultiplexer (done, expectedCalls) {
                    var numberOfCalls = 0;
                    return function (e) {
                        if (e) {
                            done(e);
                        } else if (expectedCalls === ++numberOfCalls) {
                            done();
                        }
                    };
                }

                describe("creating and cleaning a third timeout", function () {

                    it("prevents execution of the third", function (done) {
                        var thirdTimeout = Timeout.allocate(10 * MAIN_TIMEOUT),
                            done2 = _doneMultiplexer(done, 2);
                        thirdTimeout.clean();
                        firstTimeout.allow(done2);
                        fasterTimeout.allow(done2);
                        methods.handleTimeout();
                        Timeout.check();
                    });

                });

                describe("triggering", function () {

                    beforeEach(function (done) {
                        var done2 = _doneMultiplexer(done, 2);
                        firstTimeout.allow(done2);
                        fasterTimeout.allow(done2);
                        methods.handleTimeout();
                        Timeout.check();
                    });

                    it("executes the callbacks from the queue", function () {
                        assert(firstTimeout.triggered());
                        assert(fasterTimeout.triggered());
                        Timeout.check();
                    });

                    it("removed all callbacks from the queue", function () {
                        methods.handleTimeout(); // Should not trigger any callback
                        Timeout.check();
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
