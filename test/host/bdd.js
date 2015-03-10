(function (context) {
    "use strict";
    /*global global*/

    if ("undefined" !== typeof module && module.exports) {
        // node
        context = global;
    }

    /**
     * Simple BDD implementation
     */

    var
        /**
         * Abstract item
         *
         * @param {String} label
         * @constructor
         */
        BDDAbstract = function (label) {
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
        BDDDescribe = function (label) {
            BDDAbstract.apply(this, [label]);
            this.children = [];
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
        BDDIt = function (label, callback) {
            BDDAbstract.apply(this, [label]);
            this.callback = callback;
        };

    BDDAbstract.prototype = {

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

    //region BDD interface

    context.describe = function (label, callback) {
        if (null === BDDDescribe.root) {
            BDDDescribe.current
                = BDDDescribe.root
                = new BDDDescribe();
        }
        var lastCurrent = BDDDescribe.current;
        BDDDescribe.current = new BDDDescribe(label);
        lastCurrent.children.push(BDDDescribe.current);
        callback();
        BDDDescribe.current = lastCurrent;
    };

    context.it = function (label, callback) {
        BDDDescribe.current.children.push(new BDDIt(label, callback));
    };

    //endregion

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
                } else {
                    console.log("OK");
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
         * @type {Function}
         * @private
         */
        _callback = null,

        /**
         * @type {BDDDescribe[]}
         * @private
         */
        _stackOfDescribe,

        /**
         * @type {BDDDescribe}
         * @private
         */
        _describe,

        /**
         * @type {Number[]}
         * @private
         */
        _stackOfChildIdx,

        /**
         * @type {Number}
         * @private
         */
        _childIdx,

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
        _stats;

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

    function _next() {
        var item;
        if (_childIdx < _describe.children.length) {
            item = _describe.children[_childIdx];
            ++_childIdx;
            if (item instanceof BDDDescribe) {
                _callback("describe", {
                    depth: _stackOfDescribe.length,
                    label: item.label
                });
                _stackOfDescribe.push(_describe);
                _stackOfChildIdx.push(_childIdx);
                _describe = item;
                _childIdx = 0;
                _next();
            } else if (item instanceof BDDIt) {
                _it = item;
                ++_stats.count;
                if (item.callback) {
                    try {
                        _itStart = new Date();
                        item.callback(_success);
                        if (0  === item.callback.length) {
                            _success();
                        }
                    } catch (e) {
                        _fail(e);
                    }
                } else {
                    ++_stats.pending;
                    _callback("it", {
                        depth: _stackOfDescribe.length,
                        label: _it.label,
                        pending: true
                    });
                    _next();
                }
            }
        } else if (0 < _stackOfDescribe.length) {
            // No more children, go up
            _describe = _stackOfDescribe.pop();
            _childIdx = _stackOfChildIdx.pop();
            _next();
        } else {
            // DONE!
            _callback("results", _stats);
        }
    }

    function _success() {
        ++_stats.success;
        _callback("it", {
            depth: _stackOfDescribe.length,
            label: _it.label,
            result: true,
            timeSpent: (new Date()) - _itStart
        });
        _next();
    }

    function _fail(e) {
        ++_stats.fail;
        _callback("it", {
            depth: _stackOfDescribe.length,
            label: _it.label,
            result: false,
            timeSpent: (new Date()) - _itStart,
            exception: e
        });
        _next();
    }

    context.run = function (callback) {
        if (callback) {
            _callback = callback;
        } else {
            _callback = _defaultCallback;
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
