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
                    gpf.exit(data.fail);
                } else {
                    _output("OK");
                    gpf.exit(0);
                }
            }
        };

    function _defaultCallback (type, data) {
        /*jshint validthis:true*/
        _handlers[type].apply(this, [data]);
    }

    //endregion

    //region Running the tests

    var

        /**
         * Callback used to notify the caller of the progress
         *
         * @type {Function}
         */
        _runCallback = null,

        /**
         * Stack of describe items being processed
         *
         * @type {BDDDescribe[]}
         */
        _stackOfDescribe,

        /**
         * Current describe
         *
         * @type {BDDDescribe}
         */
        _describe,

        /**
         * Stack of childIdx (pointing to each describe child)
         *
         * @type {Number[]}
         */
        _stackOfChildIdx,

        /**
         * Current child idx in describe
         *
         * @type {Number}
         */
        _childIdx,

        /**
         * List of callbacks to process (before, beforeEach, ...)
         *
         * @type {function[]}
         */
        _callbacks,

        /**
         * Current callback idx in _callbacks
         *
         * @type {Number}
         */
        _callbackIdx,

        /**
         * @type {Function[]}
         */
        _beforeEach = [],

        /**
         * @type {Function[]}
         */
        _afterEach = [],

        /**
         * @type {BDDIt}
         */
        _it,

        /**
         * @type {Date}
         */
        _itStart,

        /**
         * Test statistics
         *
         * @type {Object}
         */
        _stats,

        /**
         * Count the number of nexts
         *
         * @type {number}
         */
        _stackedNext = 0;

    /**
     * Call the callback
     *
     * @param {Function} callback
     * @param {Boolean} itCallback True if the callback comes form an it clause
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
     */
    function _next() {
        if (10 === ++_stackedNext) {
            setTimeout(_next, 0);
            --_stackedNext;
            return;
        }
        _doNext();
        --_stackedNext;
    }

    /**
     * Next test / callback
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

}(this));
