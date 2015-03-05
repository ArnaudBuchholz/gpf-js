(function (context) {
    "use strict";

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
            result: true
        });
        _next();
    }

    function _fail(e) {
        ++_stats.fail;
        _callback("it", {
            depth: _stackOfDescribe.length,
            label: _it.label,
            result: false,
            exception: e
        });
        _next();
    }

    context.run = function (callback) {
        _callback = callback;
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
