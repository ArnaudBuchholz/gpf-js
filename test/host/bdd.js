/*eslint strict: [2, "function"]*/ // IIFE form
(function () {
    "use strict";

    /*global console, setTimeout, clearTimeout*/

    var context = (function () {
        /*global global*/ // NodeJS global
        if ("object" === typeof global) {
            return global;
        }
        /*global window*/ // Browser global
        if ("undefined" !== typeof window) {
            return window;
        }
        return this; //eslint-disable-line no-invalid-this
    }());

    /*
     * Simple BDD implementation
     */

    // Enumeration helper
    function _objectForEach (dictionary, callback, thisArg) {
        for (var property in dictionary) {
            if (dictionary.hasOwnProperty(property)) {
                callback.call(thisArg, dictionary[property], property, dictionary);
            }
        }
    }

    function _addMember (value, name) {
        /*jshint validthis:true*/ // Used below and bound to Constructor
        this[name] = value; //eslint-disable-line no-invalid-this
    }

    // Class helper
    function _toClass (Constructor, BaseClass, members) {
        Constructor.prototype = new BaseClass();
        _objectForEach(members, function (memberValue, memberName) {
            if ("statics" === memberName) {
                _objectForEach(memberValue, _addMember, Constructor);
            } else {
                Constructor.prototype[memberName] = memberValue;
            }
        }, Constructor);
        return Constructor;
    }

    //region BDD item classes

    /**
     * Abstract item
     *
     * @param {String} label Label describing the item
     * @param {BDDAbstract} [parent] Parent item
     * @constructor
     */
    var BDDAbstract = _toClass(function BDDAbstract (label, parent) {
        if (undefined !== parent) {
            this.parent = parent;
            if (!parent.hasOwnProperty("children")) {
                // Make the array unique to the instance
                parent.children = [];
            }
            parent.children.push(this);
        }
        this.label = label;
    }, Object, {

        /**
         * Parent item
         *
         * @type {BDDAbstract}
         */
        parent: null,

        /**
         * Children of the description
         *
         * @type {BDDDescribe[]}
         */
        children: [],

        /** Label of the item */
        label: ""

    });

    /**
     * Test description
     *
     * @param {String} label Label describing the item
     * @param {BDDDescribe} [parent] Parent item
     * @constructor
     * @extends BDDAbstract
     */
    var BDDDescribe = _toClass(function BDDDescribe (label, parent) {
        BDDAbstract.call(this, label, parent);
    }, BDDAbstract, {

        /**
         * List of before callbacks
         *
         * @type {Function[]}
         */
        before: [],

        /**
         * List of beforeEach callbacks
         *
         * @type {Function[]}
         */
        beforeEach: [],

        /**
         * List of afterEach callbacks
         *
         * @type {Function[]}
         */
        afterEach: [],

        /**
         * List of after callbacks
         *
         * @type {Function[]}
         */
        after: [],

        statics: {

            /**
             * Root test folder
             *
             * @type {BDDDescribe}
             * @static
             */
            root: null,

            /**
             * Current test folder
             *
             * @type {BDDDescribe}
             * @static
             */
            current: null,

            /**
             * Adds the callback to the list which member name is provided
             *
             * @param {String} listName List member name
             * @param {Function} callback Callback
             */
            addCallback: function (listName, callback) {
                var current = BDDDescribe.current;
                if (!current.hasOwnProperty(listName)) {
                    // Make the array unique
                    current[listName] = [];
                }
                current[listName].push(callback);
            }

        }
    });

    /**
     * Test case
     *
     * @param {String} label Label describing the item
     * @param {Function} callback Implementation of the test
     * @param {BDDDescribe} [parent] Parent item
     * @constructor
     * @extends BDDAbstract
     */
    var BDDIt = _toClass(function BDDIt (label, callback, parent) {
        BDDAbstract.call(this, label, parent);
        this.callback = callback;
    }, BDDAbstract, {

        /**
         * Test case callback (null if pending)
         *
         * @type {Function}
         */
        callback: null,

        /** Allows to make a success from a failure (and test error cases) */
        failureExpected: false

    });

    //endregion BDD item classes

    //region BDD public interface

    function _output (text, level) {
        if (undefined === level) {
            level = "log";
        }
        // Console can be mocked up to check outputs
        if (console.expects) {
            console.expects(level, text, true);
        }
        console[level](text);
    }

    _objectForEach({

        describe: function (label, callback) {
            if (null === BDDDescribe.root) {
                BDDDescribe.current = BDDDescribe.root = new BDDDescribe();
            }
            BDDDescribe.current = new BDDDescribe(label, BDDDescribe.current);
            callback();
            BDDDescribe.current = BDDDescribe.current.parent;
        },

        before: function (callback) {
            BDDDescribe.addCallback("before", callback);
        },

        beforeEach: function (callback) {
            BDDDescribe.addCallback("beforeEach", callback);
        },

        it: function (label, callback, failureExpected) {
            var it = new BDDIt(label, callback, BDDDescribe.current);
            if (failureExpected) {
                it.failureExpected = true;
            }
        },

        afterEach: function (callback) {
            BDDDescribe.addCallback("afterEach", callback);
        },

        after: function (callback) {
            BDDDescribe.addCallback("after", callback);
        },

        /**
         * Fails by throwing an exception if the value is falsy
         *
         * @param {*} condition If the condition is falsy, the assertion fails
         */
        assert: function (condition) {
            if (!condition) {
                throw new Error("ASSERTION failed");
            }
        },

        /*global exit*/
        /**
         * Simulates a way to terminate the process with a result code
         *
         * @param {Number} code Exit code
         */
        exit: function (code) {
            if (0 === code) {
                _output("exit(0)", "log");
            } else {
                _output("exit(" + code + ")", "error");
            }
        }

    }, function (memberValue, memberName) {
        if (!context[memberName]) {
            context[memberName] = memberValue;
        }
    });

    //endregion  BDD public interface

    //region default callback (based on console.log)

    var _handlers = {

        /**
         * describe callback
         *
         * @param {Object} data
         * - {Number} depth item depth
         * - {String} label item label
         */
        describe: function (data) {
            _output(new Array(data.depth + 1).join("\t") + data.label);
        },

        /**
         * it callback
         *
         * @param {Object} data
         * - {Number} depth item depth
         * - {String} label item label
         * - {Boolean} pending test with no implementation
         * - {Boolean} result test result
         * - {Object} exception exception details
         */
        it: function (data) {
            var line = new Array(data.depth + 1).join("\t");
            if (data.pending) {
                line += "-- ";
            } else if (data.result) {
                line += "OK ";
            } else {
                line += "KO ";
            }
            line += data.label;
            _output(line);
            if (false === data.result && data.exception) {
                for (var key in data.exception) {
                    if (data.exception.hasOwnProperty(key)) {
                        _output(key + ": " + data.exception[key]);
                    }
                }
            }
        },

        /**
         * results callback
         *
         * @param {Object} data
         * - {Number} count number of tests
         * - {Number} success succeeded count
         * - {Number} fail failed count
         * - {Number} pending tests with no implementation
         */
        results: function (data) {
            _output("--- Results: ");
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    _output(key + "        : ".substr(key.length)
                        + data[key]);
                }
            }
            if (data.fail) {
                _output("KO", "error");
                exit(data.fail);
            } else {
                _output("OK");
                exit(0);
            }
        }
    };

    function _defaultCallback (type, data) {
        /*jshint validthis:true*/
        _handlers[type].call(this, data); //eslint-disable-line no-invalid-this
    }

    //endregion

    //region Running the tests

    var Runner = _toClass(function Runner (callback, timeoutDelay) {
        this._state = Runner.STATE_DESCRIBE_BEFORE;
        this._callback = callback || _defaultCallback;
        this._timeoutDelay = timeoutDelay || Runner.DEFAULT_TIMEOUT_DELAY;
        this._describes = [];
        this._describe = BDDDescribe.root;
        this._nextChildIndexes = [];
        this._beforeEach = [];
        this._afterEach = [];
        this._runAt = new Date();
        this._statistics = {
            count: 0,
            success: 0,
            fail: 0,
            pending: 0
        };
        // bind next to this (and hide the prototype version)
        this.next = this.next.bind(this);
    }, Object, {

        /** Current state */
        _state: 0,

        /**
         * Callback used to notify the caller of the progress
         *
         * @type {Function}
         */
        _callback: null,

        /** Asynchronous test limit in time */
        _timeoutDelay: 0,

        /**
         * Stack of describe items being processed
         *
         * @type {BDDDescribe[]}
         */
        _describes: [],

        /**
         * Current describe
         *
         * @type {BDDDescribe}
         */
        _describe: null,

        /**
         * Stack of nextChildIndex (pointing to each describe child)
         *
         * @type {Number[]}
         */
        _nextChildIndexes: [],

        /** Next child index of current describe */
        _nextChildIndex: 0,

        /**
         * List of callbacks to process (before, beforeEach, ...)
         *
         * @type {Function[]}
         */
        _pendingCallbacks: [],

        /**
         * Type of the callbacks to process ("before", "beforeEach", ...)
         *
         * @type {String}
         */
        _pendingCallbacksType: "",

        /**
         * Stacked beforeEach callbacks
         *
         * @type {Function[]}
         */
        _beforeEach: [],

        /**
         * Stacked afterEach callbacks
         *
         * @type {Function[]}
         */
        _afterEach: [],

        /**
         * Date when the run was started
         *
         * @type {Date}
         */
        _runAt: null,

        /** Test statistics */
        _statistics: {},

        /**
         * Executes the callback and monitor its result
         *
         * @param {Function} callback Function to execute
         * @param {Function} [callbackCompleted=undefined] callbackCompleted Function called when the callback completed
         * (will be bound to the Runner), expected parameters are
         * - {Object} context
         * - {Date} startDate
         * - {Object} [error=undefined] error When not specified, it means the callback succeeded, otherwise this
         * parameter is the error object transmitted by the test execution
         * @param {Object} callbackContext context parameter of the callbackCompleted function
         * @return {Boolean} true if asynchronous
         */
        _monitorCallback: function (callback, callbackCompleted, callbackContext) {
            var monitorContext = {
                    runner: this,
                    doneExpected: 0 < callback.length,
                    callbackCompleted: callbackCompleted,
                    callbackContext: callbackContext,
                    error: null,
                    startDate: new Date(),
                    numberOfCall: 0,
                    timeoutId: null,
                    complete: this._complete
                },
                done = this._done.bind(monitorContext);
            try {
                return this._secureCall(callback, monitorContext, done);
            } catch (e) {
                monitorContext.error = e;
                monitorContext.doneExpected = false; // Assume synchronous function
                this._processCallResult(null, monitorContext, done);
            }
            return false;
        },

        // done function, is bound to a monitorContext
        _done: function (error) {
            ++this.numberOfCall;
            if (1 < this.numberOfCall) {
                // Whatever the situation, done MUST be called only once, so overwrite any error here
                error = {
                    message: "Done function called " + this.numberOfCall + " times"
                };
            }
            if (1 < this.numberOfCall || this.timeoutId) {
                // More than one call (i.e. error) or asynchronous
                this.complete(error);
            } else {
                // Can still be processed as synchronous, keep track of error parameter
                this.error = error;
            }
            if (1 === this.numberOfCall && this.timeoutId) {
                // First call in asynchronous mode, prevent timeout execution (no more necessary)...
                clearTimeout(this.timeoutId);
                // ...then, trigger the next step execution (required to continue the test)
                setTimeout(this.runner.next, 0); // next is bound
            }
        },

        // complete wrapper, is bound to a monitorContext
        _complete: function (error) {
            this.callbackCompleted.call(this.runner, this.callbackContext, this.startDate, error);
        },

        // provide done parameter only if requested
        _secureCall: function (callback, monitorContext, done) {
            var callbackArgument;
            // If someone wants to mess with arguments, this will prevent it
            if (monitorContext.doneExpected) {
                callbackArgument = done;
            }
            return this._processCallResult(callback(callbackArgument), monitorContext, done);
        },

        // handle the result of the callback
        _processCallResult: function (result, monitorContext, done) {
            var isPromise = Runner.isPromise(result);
            // Synchronous call?
            if (!isPromise && !monitorContext.doneExpected) {
                monitorContext.complete(monitorContext.error);
                done();
                return false;
            }
            // Was done already called?
            if (1 === monitorContext.numberOfCall) {
                monitorContext.complete(monitorContext.error);
                return false;
            } else if (0 < monitorContext.numberOfCall) {
                return false;
            }
            // From there, the callback is asynchronous!
            monitorContext.timeoutId = setTimeout(function () {
                done({
                    message: "Timeout exceeded"
                });
            }, this._timeoutDelay);
            if (isPromise) {
                this._attachToPromise(result, done);
            }
            return true;
        },

        /**
         * @param {Promise} promise Promise to attach to
         * @param {Function} done Callback to trigger when the promise is completed
         */
        _attachToPromise: function (promise, done) {
            var _rejectionReason;
            function fulfilled () {
                done(); // Must have no parameter
            }
            function rejected (reason) {
                if (!reason) {
                    reason = {
                        message: "Promise rejected with no reason"
                    };
                }
                _rejectionReason = reason;
                done(reason);
            }
            function caught (reason) {
                if (reason !== _rejectionReason) {
                    done(reason);
                }
            }
            promise.then(fulfilled, rejected);
            var catchMethod = promise["catch"];
            if (catchMethod) {
                catchMethod.call(promise, caught);
            }
        },

        /**
         * Call the it test callback
         *
         * @param {BDDIt} it Test case
         * @return {Boolean} true if asynchronous
         */
        _processItCallback: function (it) {
            return this._monitorCallback(it.callback, this._itCallbackCompleted, it);
        },

        // IT Callback completion function (see _monitorCallback)
        _itCallbackCompleted: function (it, startDate, e) {
            if (it.failureExpected) {
                if (e) {
                    e = null;
                } else {
                    e = {
                        message: "Failure was expected"
                    };
                }
            }
            if (e) {
                this._fail(it.label, startDate, e);
            } else {
                this._success(it.label, startDate);
            }
        },

        // Log a failure
        _fail: function (label, startDate, e) {
            ++this._statistics.fail;
            this._callback("it", {
                depth: this._describes.length,
                label: label,
                result: false,
                timeSpent: new Date() - startDate,
                exception: e
            });
        },

        // Log a success
        _success: function (label, startDate) {
            ++this._statistics.success;
            this._callback("it", {
                depth: this._describes.length,
                label: label,
                result: true,
                timeSpent: new Date() - startDate
            });
        },

        /**
         * Call (before|after)(Each)? callback
         *
         * @param {Function} callback Function to call
         * @return {Boolean} true if asynchronous
         */
        _processCallback: function (callback) {
            return this._monitorCallback(callback, this._callbackCompleted);
        },

        // Callback completion function (see _monitorCallback)
        _callbackCompleted: function (ignored, startDate, e) {
            if (e) {
                this._fail("UNEXPECTED error during " + this._pendingCallbacksType + "?", startDate, e);
                // TODO right now, an error is not acceptable at this point, signal and ends everything
                this._nextChildIndex = this._describe.children.length;
                this._describes = [];
            }
        },

        // Next step in test
        next: function () {
            // Because of cscript compatibility
            var loop = true;
            while (loop) {
                // Check if any pending callback
                while (this._pendingCallbacks.length) {
                    if (this._processCallback(this._pendingCallbacks.shift())) {
                        // Asynchronous, have to wait for callback
                        return;
                    }
                }
                // _state contains the member to execute
                loop = this[this._state]();
            }
        },

        // STATE_DESCRIBE_BEFORE
        _onDescribeBefore: function () {
            var describe = this._describe;
            this._state = Runner.STATE_DESCRIBE_CHILDREN;
            this._pendingCallbacks = [].concat(describe.before);
            this._pendingCallbacksType = "before";
            return true;
        },

        // STATE_DESCRIBE_CHILDREN
        _onDescribeChildren: function () {
            var children = this._describe.children;
            if (this._nextChildIndex < children.length) {
                var item = children[this._nextChildIndex++];
                if (item instanceof BDDDescribe) {
                    this._stackDescribe(item);

                } else if (item instanceof BDDIt) {
                    this._state = Runner.STATE_DESCRIBE_CHILDIT_BEFORE;
                }
            } else {
                this._state = Runner.STATE_DESCRIBE_AFTER;
            }
            return true;
        },

        // STATE_DESCRIBE_CHILDREN: describe found
        _stackDescribe: function (describe) {
            this._state = Runner.STATE_DESCRIBE_BEFORE;
            this._callback("describe", {
                depth: this._describes.length,
                label: describe.label
            });
            this._describes.push(this._describe);
            this._nextChildIndexes.push(this._nextChildIndex);
            // Concatenate lists of beforeEach and afterEach
            this._beforeEach = this._beforeEach.concat(describe.beforeEach);
            this._afterEach = describe.afterEach.concat(this._afterEach);
            // Becomes the new describe
            this._describe = describe;
            this._nextChildIndex = 0;
        },

        // STATE_DESCRIBE_CHILDIT_BEFORE
        _onItBefore: function () {
            this._state = Runner.STATE_DESCRIBE_CHILDIT_EXECUTE;
            this._pendingCallbacks = [].concat(this._beforeEach);
            this._pendingCallbacksType = "beforeEach";
            return true;
        },

        // STATE_DESCRIBE_CHILDIT_EXECUTE
        _onItExecute: function () {
            this._state = Runner.STATE_DESCRIBE_CHILDIT_AFTER;
            var it = this._describe.children[this._nextChildIndex - 1];
            ++this._statistics.count;
            if (it.callback) {
                return !this._processItCallback(it);
            }
            ++this._statistics.pending;
            this._callback("it", {
                depth: this._describes.length,
                label: it.label,
                pending: true
            });
            return true;
        },

        // STATE_DESCRIBE_CHILDIT_AFTER
        _onItAfter: function () {
            this._state = Runner.STATE_DESCRIBE_CHILDREN;
            this._pendingCallbacks = [].concat(this._afterEach);
            this._pendingCallbacksType = "afterEach";
            return true;
        },

        // STATE_DESCRIBE_AFTER
        _onDescribeAfter: function () {
            var describe = this._describe;
            this._state = Runner.STATE_DESCRIBE_DONE;
            this._pendingCallbacks = [].concat(describe.after);
            this._pendingCallbacksType = "after";
            return true;
        },

        // STATE_DESCRIBE_DONE
        _onDescribeDone: function () {
            if (0 < this._describes.length) {
                // What's in the describe stack
                this._unstackDescribe();
                return true;
            }
            this._state = Runner.STATE_FINISHED;
            this._statistics.timeSpent = new Date() - this._runAt;
            this._callback("results", this._statistics);
            return false;
        },

        _unstackDescribe: function () {
            this._state = Runner.STATE_DESCRIBE_CHILDREN;
            var currentDescribe = this._describe;
            // Remove lists of beforeEach and afterEach
            this._beforeEach = this._beforeEach.slice(0, this._beforeEach.length - currentDescribe.beforeEach.length);
            this._afterEach = this._afterEach.slice(currentDescribe.afterEach.length);
            // No more children, go up
            this._describe = this._describes.pop();
            this._nextChildIndex = this._nextChildIndexes.pop();
        },

        // STATE_FINISHED
        _onFinished: function () {
            return false;
        },

        statics: {
            STATE_DESCRIBE_BEFORE: "_onDescribeBefore",
            STATE_DESCRIBE_CHILDREN: "_onDescribeChildren",
            STATE_DESCRIBE_CHILDIT_BEFORE: "_onItBefore",
            STATE_DESCRIBE_CHILDIT_EXECUTE: "_onItExecute",
            STATE_DESCRIBE_CHILDIT_AFTER: "_onItAfter",
            STATE_DESCRIBE_AFTER: "_onDescribeAfter",
            STATE_DESCRIBE_DONE: "_onDescribeDone",
            STATE_FINISHED: "_onFinished",

            DEFAULT_TIMEOUT_DELAY: 2000, // 2s

            // Test if the provided parameter looks like a promise
            isPromise: function (obj) {
                return null !== obj && "object" === typeof obj && "function" === typeof obj.then;
            }
        }
    });

    /**
     * Main entry point to run all tests
     *
     * @param {Function} callback see callback examples above
     * @param {Number} timeoutDelay asynchronous test limit in time (ms)
     */
    context.run = function (callback, timeoutDelay) {
        var runner = new Runner(callback, timeoutDelay);
        runner.next();
    };

    //endregion

}());
