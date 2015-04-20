(function () {
    "use strict";

    if (undefined === typeof gpf) {
        // gpf is required
        console.error("GPF required");
    }

    var context = gpf.context();

    /**
     * Simple BDD implementation
     */

    // region BDD item classes

    var
        /**
         * Abstract item
         *
         * @param {String} label
         * @constructor
         */
        BDDAbstract = function (label, parent) {
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
        },

        /**
         * Test description
         *
         * @constructor
         * @param {String} label
         * @class BDDDescribe
         * @extends BDDAbstract
         */
        BDDDescribe = function (/*label, parent*/) {
            BDDAbstract.apply(this, arguments);
        },

        /**
         * Test case
         *
         * @constructor
         * @param {String} label
         * @param {Function} callback
         * @class BDDIt
         * @extends BDDAbstract
         */
        BDDIt = function (label, callback, parent) {
            BDDAbstract.apply(this, [label, parent]);
            this.callback = callback;
        };

    BDDAbstract.prototype = {

        /**
         * Parent item
         *
         * @type {BDDAbstract}
         * @read-only
         */
        parent: null,

        /**
         * Label of the item
         *
         * @type {String}
         * @read-only
         */
        label: ""

    };

    BDDDescribe.prototype = new BDDAbstract();

    /**
     * Children of the description
     *
     * @type {BDDDescribe[]}
     * @read-only
     */
    BDDDescribe.prototype.children = [];

    /**
     * List of before callbacks
     *
     * @type {Function[]}
     * @read-only
     */
    BDDDescribe.prototype.before = [];

    /**
     * List of beforeEach callbacks
     *
     * @type {Function[]}
     * @read-only
     */
    BDDDescribe.prototype.beforeEach = [];

    /**
     * List of afterEach callbacks
     *
     * @type {Function[]}
     * @read-only
     */
    BDDDescribe.prototype.afterEach = [];

    /**
     * List of after callbacks
     *
     * @type {Function[]}
     * @read-only
     */
    BDDDescribe.prototype.after = [];

    /**
     * Root test folder
     *
     * @type {BDDDescribe}
     * @static
     */
    BDDDescribe.root = null;

    /**
     * Current test folder
     *
     * @type {BDDDescribe}
     * @static
     */
    BDDDescribe.current = null;

    BDDIt.prototype = new BDDAbstract();
    /**
     * Test case callback
     *
     * @type {Function}
     * @read-only
     */
    BDDIt.prototype.callback = null;

    //endregion BDD item classes

    //region BDD public interface

    context.describe = function (label, callback) {
        if (null === BDDDescribe.root) {
            BDDDescribe.current
                = BDDDescribe.root
                = new BDDDescribe();
        }
        BDDDescribe.current = new BDDDescribe(label, BDDDescribe.current);
        callback();
        BDDDescribe.current = BDDDescribe.current.parent;
    };

    /**
     * Added the callback to the list which member name is provided
     *
     * @param {String} listName List member name
     * @param {Function} callback
     * @private
     */
    function _addTo(listName, callback) {
        var current = BDDDescribe.current;
        if (!current.hasOwnProperty(listName)) {
            // Make the array unique
            current[listName] = [];
        }
        current[listName].push(callback);
    }

    context.before = function (callback) {
        _addTo("before", callback);
    };

    context.beforeEach = function (callback) {
        _addTo("beforeEach", callback);
    };

    context.it = function (label, callback) {
        return new BDDIt(label, callback, BDDDescribe.current);
    };

    context.afterEach = function (callback) {
        _addTo("afterEach", callback);
    };

    context.after = function (callback) {
        _addTo("after", callback);
    };

    //endregion  BDD public interface

    //region default callback (based on console.log)

    var
        _handlers = {

            /**
             * describe callback
             *
             * @param {Object} data
             * <ul>
             *     <li>{Number} depth: item depth</li>
             *     <li>{String} label: item label</li>
             * </ul>
             */
            "describe": function (data) {
                console.log((new Array(data.depth + 1).join("\t"))
                    + data.label);

            },

            /**
             * it callback
             *
             * @param {Object} data
             * <ul>
             *     <li>{Number} depth: item depth</li>
             *     <li>{String} label: item label</li>
             *     <li>{Boolean} pending: test with no implementation</li>
             *     <li>{Boolean} result: test result</li>
             *     <li>{Object} exception: exception details</li>
             * </ul>
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
                console.log(line);
                if (false === data.result && data.exception) {
                    for (var key in data.exception) {
                        if (data.exception.hasOwnProperty(key)) {
                            console.log(key + ": " + data.exception[key]);
                        }
                    }
                }
            },

            /**
             * results callback
             *
             * @param {Object} data
             * <ul>
             *     <li>{Number} count: number of tests</li>
             *     <li>{Number} success: succeeded count</li>
             *     <li>{Number} fail: failed count</li>
             *     <li>{Number} pending: tests with no implementation</li>
             * </ul>
             */
            "results": function (data) {
                console.log("--- Results: ");
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        console.log(key + "        : ".substr(key.length)
                        + data[key]);
                    }
                }
                if (data.fail) {
                    console.error("KO");
                    gpf.exit(data.fail);
                } else {
                    console.log("OK");
                    gpf.exit(0);
                }
            }
        },

        _defaultCallback = function (type, data) {
            _handlers[type].apply(this, [data]);
        };

    //endregion

    //region Running the tests

    var

        /**
         * Callback used to notify the caller of the progress
         *
         * @type {Function}
         * @private
         */
        _runCallback = null,

        /**
         * Stack of describe items being processed
         *
         * @type {BDDDescribe[]}
         * @private
         */
        _stackOfDescribe,

        /**
         * Current describe
         *
         * @type {BDDDescribe}
         * @private
         */
        _describe,

        /**
         * Stack of childIdx (pointing to each describe child)
         *
         * @type {Number[]}
         * @private
         */
        _stackOfChildIdx,

        /**
         * Current child idx in describe
         *
         * @type {Number}
         * @private
         */
        _childIdx,

        /**
         * List of callbacks to process (before, beforeEach, ...)
         *
         * @type {function[]}
         * @private
         */
        _callbacks,

        /**
         * Current callback idx in _callbacks
         *
         * @type {Number}
         * @private
         */
        _callbackIdx,

        /**
         * @type {Function[]}
         * @private
         */
        _beforeEach = [],

        /**
         * @type {Function[]}
         * @private
         */
        _afterEach = [],

        /**
         * @type {BDDIt}
         * @private
         */
        _it,

        /**
         * @type {Date}
         * @private
         */
        _itStart,

        /**
         * Test statistics
         *
         * @type {Object}
         * @private
         */
        _stats,

        /**
         * Count the number of nexts
         *
         * @type {number}
         * @private
         */
        _stackedNext = 0;

    if (!context.assert) {
        /**
         * Fails by throwing an exception if the value is falsy
         *
         * @param {*} condition
         */
        context.assert = function (condition) {
            if (!condition) {
                throw {
                    message: "ASSERTION failed"
                };
            }
        };
    }

    /**
     * Call the callback
     *
     * @param {Function} callback
     * @param {Boolean} itCallback True if the callback comes form an it clause
     * @private
     */
    function _processCallback(callback, itCallback) {
        var done;
        if (itCallback) {
            done = _success;
        } else {
            done = _next;
        }
        try {
            _itStart = new Date();
            callback(done);
            if (0  === callback.length) {
                done();
            }
        } catch (e) {
            if (!itCallback) {
                // An error is not acceptable at this point, signal
                _it = {
                    label: "UNEXPECTED error during (before|after)(Each)?"
                };
            }
            _fail(e);
            if (!itCallback) {
                // And end everything
                _childIdx = _describe.children.length;
                _stackOfDescribe = [];
            }
        }
    }

    /**
     * Next test / callback
     * Protected to limit the stack depth.
     *
     * @private
     */
    function _next() {
        if (30 === ++_stackedNext) {
            gpf.defer(_next, 0);
            --_stackedNext;
            return;
        }
        _doNext();
        --_stackedNext;
    }

    /**
     * Next test / callback
     *
     * @private
     */
    function _doNext() {
        var item;
        // Any callback list pending?
        if (_callbacks && _callbackIdx < _callbacks.length) {
            item = _callbacks[_callbackIdx];
            ++_callbackIdx;
            _processCallback(item, false);

        } else if (_childIdx < _describe.children.length) {
            item = _describe.children[_childIdx];
            ++_childIdx;
            if (item instanceof BDDDescribe) {
                // call before if any
                if (item.before.length && _callbacks !== item.before) {
                    _callbacks = item.before;
                    _callbackIdx = 0;
                    --_childIdx;
                    _next();
                    return;
                }
                // Notify caller
                _runCallback("describe", {
                    depth: _stackOfDescribe.length,
                    label: item.label
                });
                _stackOfDescribe.push(_describe);
                _stackOfChildIdx.push(_childIdx);
                // Concatenate lists of beforeEach and afterEach
                _beforeEach = _beforeEach.concat(item.beforeEach);
                _afterEach = item.afterEach.concat(_afterEach);
                // Becomes the new describe
                _describe = item;
                _childIdx = 0;
                _next();

            } else if (item instanceof BDDIt) {
                // Call beforeEach if any
                if (_it !== item
                    && _beforeEach.length && _callbacks !== _beforeEach) {
                    _callbacks = _beforeEach;
                    _callbackIdx = 0;
                    --_childIdx;
                    _next();
                    return;
                }
                // Prepare list of afterEach if any
                _callbacks = _afterEach;
                _callbackIdx = 0;
                // Process the item
                _it = item;
                ++_stats.count;
                if (item.callback) {
                    _processCallback(item.callback, true);
                } else {
                    ++_stats.pending;
                    _runCallback("it", {
                        depth: _stackOfDescribe.length,
                        label: _it.label,
                        pending: true
                    });
                    _next();
                }

            }
        } else if (0 < _stackOfDescribe.length) {
            // call after if any
            if (_describe.after.length && _callbacks !== _describe.after) {
                _callbacks = item.before;
                _callbackIdx = 0;
                _next();
                return;
            }
            // Remove lists of beforeEach and afterEach
            _beforeEach = _beforeEach.slice(0, _beforeEach.length
                - _describe.beforeEach.length);
            _afterEach = _afterEach.slice(_describe.afterEach.length);
            // No more children, go up
            _describe = _stackOfDescribe.pop();
            _childIdx = _stackOfChildIdx.pop();
            _next();

        } else {
            // DONE!
            _runCallback("results", _stats);
        }
    }

    /**
     * The last it succeeded
     *
     * @private
     */
    function _success() {
        ++_stats.success;
        _runCallback("it", {
            depth: _stackOfDescribe.length,
            label: _it.label,
            result: true,
            timeSpent: (new Date()) - _itStart
        });
        _next();
    }

    /**
     * The last it failed
     *
     * @private
     */
    function _fail(e) {
        ++_stats.fail;
        _runCallback("it", {
            depth: _stackOfDescribe.length,
            label: _it.label,
            result: false,
            timeSpent: (new Date()) - _itStart,
            exception: e
        });
        _next();
    }

    /**
     * Main entry point to run all tests
     *
     * @param {Function} callback see callback examples above
     */
    context.run = function (callback) {
        if (callback) {
            _runCallback = callback;
        } else {
            _runCallback = _defaultCallback;
        }
        _stackOfDescribe = [];
        _describe = BDDDescribe.root;
        _stackOfChildIdx = [];
        _childIdx = 0;
        _stats = {
            count: 0,
            success: 0,
            fail: 0,
            pending: 0
        };
        _next();
    };

    //endregion

}());
