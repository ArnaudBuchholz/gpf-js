(function (context) {
    "use strict";

    /**
     * Simple test implementation
     */

    var
        /**
         * Test folder
         *
         * @constructor
         * @param {String} label
         * @class TestFolder
         * @private
         */
        TestFolder = function (label) {
            this.label = label;
            this.children = [];
        },

        /**
         * Test case
         *
         * @constructor
         * @param {String} label
         * @param {Function} callback
         * @class TestCase
         * @private
         */
        TestCase = function (label, callback) {
            this.label = label;
            this.callback = callback;
        };

    TestFolder.prototype = {

        /**
         * Label of the test folder
         *
         * @type {String}
         * @read-only
         */
        label: "",

        /**
         * Children of the test folder
         *
         * @type {TestFolder[]}
         * @read-only
         */
        children: []
    };

    /**
     * Root test folder
     *
     * @type {TestFolder}
     * @static
     */
    TestFolder.root = null;

    /**
     * Current test folder
     *
     * @type {TestFolder}
     * @static
     */
    TestFolder.current = null;

    TestCase.prototype = {

        /**
         * Label of the test case
         *
         * @type {String}
         * @read-only
         */
        label: "",

        /**
         * Test case callback
         *
         * @type {Function}
         * @read-only
         */
        callback: null

    };

    context.describe = function (label, callback) {
        if (null === TestFolder.root) {
            TestFolder.current
                = TestFolder.root
                = new TestFolder();
        }
        var lastCurrent = TestFolder.current;
        TestFolder.current = new TestFolder(label);
        lastCurrent.children.push(TestFolder.current);
        callback();
        TestFolder.current = lastCurrent;
    };

    context.it = function (label, callback) {
        TestFolder.current.children.push(new TestCase(label, callback));
    };

    context.run = function () {
        console.log("OK");
    };

}(this));
