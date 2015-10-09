(function (context) {
    "use strict";

    if ("object" === typeof global) {
        context = global;
    }

    /**
     * Simple BDD implementation
     */

    // Enumeration helper
    function _objectForEach(dictionary, callback, thisArg) {
        for (var property in dictionary) {
            if (dictionary.hasOwnProperty(property)) {
                callback.apply(thisArg, [dictionary[property], property, dictionary]);
            }
        }
    }

    //region BDD item classes

    Function.prototype.toClass = function (BaseClass, members, statics) {
        this.prototype = new BaseClass();
        _objectForEach(members, function (memberValue, memberName) {
            this.prototype[memberName] = memberValue;
        }, this);
        _objectForEach(statics, function (memberValue, memberName) {
            this[memberName] = memberValue;
        }, this);
        return this;
    };

    /**
     * Abstract item
     *
     * @param {String} label
     * @constructor
     */
    var BDDAbstract  = (function (label, parent) {
        if (undefined !== parent) {
            this.parent = parent;
            if (parent instanceof BDDDescribe) {
                if (!parent.hasOwnProperty("children")) {
                    // Make the array unique to the instance
                    parent.children = [];
                }
                parent.children.push(this);
            }
        }
        this.label = label;
    }).toClass(Object, {

        // @property {BDDAbstract} Parent item
        parent: null,

        // Label of the item
        label: ""

    }, {});

    /**
     * Test description
     *
     * @constructor
     * @param {String} label
     * @class BDDDescribe
     * @extends BDDAbstract
     */
    var BDDDescribe = (function (/*label, parent*/) {
        BDDAbstract.apply(this, arguments);
    }).toClass(BDDAbstract, {

        // @prototype {BDDDescribe[]} Children of the description
        children: [],

        // @property {Function[]} List of before callbacks
        before: [],

        // @property {Function[]} List of beforeEach callbacks
        beforeEach: [],

        // @property {Function[]} List of afterEach callbacks
        afterEach: [],

        // @property {Function[]} List of after callbacks
        after: []

    }, {

        // @property {BDDDescribe} Root test folder
        root: null,

        // @property {BDDDescribe} Current test folder
        current: null,

        /**
         * Added the callback to the list which member name is provided
         *
         * @param {String} listName List member name
         * @param {Function} callback
         */
        addCallback: function (listName, callback) {
            var current = BDDDescribe.current;
            if (!current.hasOwnProperty(listName)) {
                // Make the array unique
                current[listName] = [];
            }
            current[listName].push(callback);
        }

    });

    /**
     * Test case
     *
     * @constructor
     * @param {String} label
     * @param {Function} callback
     * @class BDDIt
     * @extends BDDAbstract
     */
    var BDDIt = (function (label, callback, parent) {
        BDDAbstract.apply(this, [label, parent]);
        this.callback = callback;
    }).toClass(BDDAbstract, {

        // @prototype {Function} Test case callback (null if pending)
        callback: null

    }, {});

    //endregion BDD item classes

    //region BDD public interface

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

        it: function (label, callback) {
            return new BDDIt(label, callback, BDDDescribe.current);
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
         * @param {*} condition
         */
        assert: function (condition) {
            if (!condition) {
                throw {
                    message: "ASSERTION failed"
                };
            }
        },

        /*global exit*/
        /**
         * Simulates a way to terminate the process with a result code
         *
         * @param {Number} code
         */
        exit: function (code) {
            if (0 === code) {
                _output("exit(0)", "log");
            } else {
                _output("exit(" + code + ")", "error");
            }
        }

    }, function (memberValue, memberName) {
        if (!this[memberName]) {
            this[memberName] = memberValue;
        }
    }, context);

    //endregion  BDD public interface

    //region default callback (based on console.log)

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

    var _handlers = {

        /**
         * describe callback
         *
         * @param {Object} data
         * - {Number} depth item depth
         * - {String} label item label
         */
        "describe": function (data) {
            _output((new Array(data.depth + 1).join("\t")) + data.label);
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
        "it": function (data) {
            var line = (new Array(data.depth + 1).join("\t"));
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
        "results": function (data) {
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
        _handlers[type].apply(this, [data]);
    }

    //endregion

    //region Running the tests

    var Runner = (function (callback, timeoutDelay) {
        this._state = Runner.STATE_DESCRIBE_BEFORE;
        this._callback = callback || _defaultCallback;
        this._timeoutDelay = timeoutDelay || Runner.DEFAULT_TIMEOUT_DELAY;
        this._describes = [];
        this._describe = BDDDescribe.root;
        this._nextChildIndexes = [];
        this._beforeEach = [];
        this._afterEach = [];
        this._statistics = {
            count: 0,
            success: 0,
            fail: 0,
            pending: 0
        };
    }).toClass(Object, {

        // The current state
        _state: 0,

        // @property {Function} Callback used to notify the caller of the progress
        _callback: null,

        // @property asynchronous test limit in time
        _timeoutDelay: 0,

        // @property {BDDDescribe[]} Stack of describe items being processed
        _describes: [],

        // @property {BDDDescribe} Current describe
        _describe: null,

        // @property {Number[]} Stack of nextChildIndex (pointing to each describe child)
        _nextChildIndexes: [],

        // Next child index of current describe
        _nextChildIndex: 0,

        // @property {function[]} List of callbacks to process (before, beforeEach, ...)
        _pendingCallbacks: [],

        // @property {Function[]} stacked beforeEach callbacks
        _beforeEach: [],

        // @property {Function[]} stacked afterEach callbacks
        _afterEach: [],

        // @property {Object} Test statistics
        _statistics: {},

        // Log a success
        _success: function (label, startDate) {
            ++this._statistics.success;
            this._callback("it", {
                depth: this._describes.length,
                label: label,
                result: true,
                timeSpent: (new Date()) - startDate
            });
        },

        // Log a failure
        _fail: function (label, startDate, e) {
            ++this._statistics.fail;
            this._callback("it", {
                depth: this._describes.length,
                label: label,
                result: false,
                timeSpent: (new Date()) - startDate,
                exception: e
            });
        },

        /**
         * Executes the callback and monitor its result
         *
         * @param {Function} callback
         * @param {Function} [callbackCompleted=undefined] callbackCompleted Function called when callback completed
         * (will be bound to this), expected parameters are
         * - {Object} context
         * - {Date} startDate
         * - {Object} [error=undefined] error When not specified, it means the callback succeeded, otherwise this
         * parameter is the error object transmitted by the test execution
         * @param {Object} context
         * @return {Boolean} true if asynchronous
         */
        _monitorCallback: function (callback, callbackCompleted, context) {
            var runner = this,
                startDate = new Date(),
                signaled = 0,
                timeoutId,
                result,
                isPromise;
            function done(error) {
                ++signaled;
                if (1 < signaled) {
                    // Whatever the situation, done MUST be called only once, so overwrite any error here
                    error = {
                        message: "Done function called " + signaled + " times"
                    };
                }
                callbackCompleted.apply(runner, [context, startDate, error]);
                if (1 === signaled && timeoutId) {
                    // This is an asynchronous, call: first, prevent timeout execution (no more necessary)...
                    clearTimeout(timeoutId);
                    // ...then, trigger the next step execution (required to continue the test)
                    runner.next();
                }
            }
            try {
                result = callback(done);
                isPromise = Runner.isPromise(result);
                // Synchronous call?
                if (!isPromise && 0 === callback.length) {
                    done();
                    return false;
                }
                // Was done already called?
                if (0 < signaled) {
                    return false;
                }
                // From there, the callback is asynchronous!
                timeoutId = setTimeout(function () {
                    done({
                        message: "Timeout exceeded"
                    });
                }, this._timeoutDelay);
                if (isPromise) {
                    this._attachToPromise(result);
                }
                return true;
            } catch (e) {
                done(e);
            }
            return false;
        },

        /**
         * @param {Function} done done callback
         * @param {Promise} promise
         */
        _attachToPromise: function (done, promise) {
            function fulfilled() {
                done(); // Must have no parameter
            }
            function rejected(reason) {
                if (!reason) {
                    reason = {
                        message: "Promise rejected with no reason"
                    };
                }
                done(reason);
            }
            promise.then(fulfilled, rejected);
            if (promise.catch) {
                promise.catch(rejected);
            }
        },

        _getCurrentIt: function () {
            return this._describe.children[this._nextChildIndex - 1];
        },

        /**
         * Call the it test callback
         *
         * @param {Function} callback
         * @param {String} label
         * @return {Boolean} true if asynchronous
         */
        _processItCallback: function () {
            var it = this._getCurrentIt();
            return this._monitorCallback(it.callback, this._itCallbackCompleted, it);
        },

        // IT Callback completion function (see _monitorCallback)
        _itCallbackCompleted: function (it, startDate, e) {
            if (e) {
                this._fail(it.label, startDate, e);
            } else {
                this._success(it.label, startDate);
            }
        },

        /**
         * Call (before|after)(Each)? callback
         *
         * @param {Function} callback
         * @return {Boolean} true if asynchronous
         */
        _processCallback: function (type, callback) {
            return this._monitorCallback(callback, this._callbackCompleted, type);
        },

        // Callback completion function (see _monitorCallback)
        _callbackCompleted: function (type, startDate, e) {
            if (e) {
                this._fail("UNEXPECTED error during " + type + "?", startDate, e);
                // TODO right now, an error is not acceptable at this point, signal and ends everything
                this._nextChildIndex = this._describe.children.length;
                this._describes = [];
            }
        },

        // Next step in test
        next: function () {
            do {
                // Check if any pending callback
                while (this._pendingCallbacks.length) {
                    if (this._processCallback(Runner.CALLBACKS_TYPE[this._state], this._pendingCallbacks.shift())) {
                        // Asynchronous, have to wait for callback
                        return;
                    }
                }
            // _state contains the member to execute
            } while (this[this._state]());
        },

        // STATE_DESCRIBE_BEFORE
        _onDescribeBefore: function () {
            var describe = this._describe;
            this._state = Runner.STATE_DESCRIBE_CHILDREN;
            this._pendingCallbacks = [].concat(describe.before);
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
            return true;
        },

        // STATE_DESCRIBE_CHILDIT_EXECUTE
        _onItExecute: function () {
            this._state = Runner.STATE_DESCRIBE_CHILDIT_AFTER;
            var it = this._getCurrentIt();
            ++this._statistics.count;
            if (it.callback) {
                return !this._processItCallback();
            } else {
                ++this._statistics.pending;
                this._callback("it", {
                    depth: this._describes.length,
                    label: it.label,
                    pending: true
                });
                return true;
            }
        },

        // STATE_DESCRIBE_CHILDIT_AFTER
        _onItAfter: function () {
            this._state = Runner.STATE_DESCRIBE_CHILDREN;
            this._pendingCallbacks = [].concat(this._afterEach);
            return true;
        },

        // STATE_DESCRIBE_AFTER
        _onDescribeAfter: function () {
            var describe = this._describe;
            this._state = Runner.STATE_DESCRIBE_DONE;
            this._pendingCallbacks = [].concat(describe.after);
            return true;
        },

        // STATE_DESCRIBE_DONE
        _onDescribeDone: function () {
            if (0 < this._describes.length) {
                // What's in the describe stack
                this._unstackDescribe();
                return true;

            } else {
                this._state = Runner.STATE_FINISHED;
                this._callback("results", this._statistics);
                return false;
            }
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
        }

    }, {
        STATE_DESCRIBE_BEFORE: "_onDescribeBefore",
        STATE_DESCRIBE_CHILDREN: "_onDescribeChildren",
        STATE_DESCRIBE_CHILDIT_BEFORE: "_onItBefore",
        STATE_DESCRIBE_CHILDIT_EXECUTE: "_onItExecute",
        STATE_DESCRIBE_CHILDIT_AFTER: "_onItAfter",
        STATE_DESCRIBE_AFTER: "_onDescribeAfter",
        STATE_DESCRIBE_DONE: "_onDescribeDone",
        STATE_FINISHED: "_onFinished",

        DEFAULT_TIMEOUT_DELAY: 2000, // 2s

        CALLBACKS_TYPE: {
            "_onDescribeBefore": "before",
            "_onItBefore": "beforeEach",
            "_onItAfter": "afterEach",
            "_onDescribeAfter": "after"
        },

        // Test if the provided parameter looks like a promise
        isPromise: function (obj) {
            return "object" === typeof obj && "function" === typeof obj.then;
        }
    });

    /**
     * Main entry point to run all tests
     *
     * @param {Function} callback see callback examples above
     * @param {Number} timeoutDelay asynchronous test limit in time
     */
    context.run = function (callback, timeoutDelay) {
        var runner = new Runner(callback, timeoutDelay);
        runner.next();
    };

    //endregion

}(this));
