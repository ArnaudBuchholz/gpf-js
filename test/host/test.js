(function (context) {
    "use strict";

    var
        /**
         * Test node
         *
         * @constructor
         * @private
         */
        _TestNode = function (label) {
            this.label = label;
            this.children = [];
        },

        /**
         * Root test node
         *
         * @type {_TestNode}
         * @private
         */
        _root = null,

        /**
         * Current test node
         *
         * @type {_TestNode}
         * @private
         */
        _current;

    // _TestNode prototype
    _TestNode.prototype = {

        /**
         * Label of the test node
         *
         * @type {String}
         * @read-only
         */
        label: "",

        /**
         * Children of the test node
         *
         * @type {_TestNode[]}
         */
        children: []
    };

    context.describe = function (label, callback) {
        if (null === _root) {
            _root = new _TestNode();
            _current = _root;
        }
        var lastCurrent = _current;
        _current = new _TestNode(label);
        lastCurrent.children.push(_current);
        callback();
        _current = lastCurrent;
    };

    context.it = function (label, callback) {
    };

    context.assert = {

    };

}(this));
