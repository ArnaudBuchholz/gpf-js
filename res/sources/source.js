gpf.require.define({}, function () {
    "use strict";

    var NOT_FOUND = -1;

    //region Source and SourceArray definitions
    return gpf.define({
        $class: "Source",

        constructor: function (array, source, dependencies) {
            this._array = array;
            this._name = source.name;
            this._index = array.getLength();
            if (source.test !== false) {
                this._test = true;
            }
            if (source.tags) {
                this._tags = source.tags.split(" ");
            }
            if (dependencies) {
                this._processDependencies(dependencies);
            }
        },

        /**
         * Source array
         *
         * @type {SourceArray}
         */
        _array: null,

        /** Source name */
        _name: "",

        /** @gpf:read _name */
        getName: function () {
            return this._name;
        },

        /** Source index */
        _index: NOT_FOUND,

        /** @gpf:read _index */
        getIndex: function () {
            return this._index;
        },

        /** @gpf:write _index */
        setIndex: function (value) {
            this._index = value;
        },

        /** Source has a test counterpart */
        _test: false,

        /** @gpf:read _test */
        getTest: function () {
            return this._test;
        },

        /** Tags */
        _tags: [],

        /** @gpf:read _tags */
        getTags: function () {
            return this._tags;
        },

        /**
         * List of dependencies (boot is excluded)
         *
         * @type {String[]}
         */
        _dependsOn: [],

        /** @gpf:read _dependsOn */
        getDependencies: function () {
            return this._dependsOn;
        },

        /**
         * List of module dependencies
         *
         * @type {String[]}
         */
        _dependencyOf: [],

        /** @gpf:read _dependencyOf */
        getDependencyOf: function () {
            return this._dependencyOf;
        },

        /**
         * Extract from the dependencies dictionary
         *
         * @param {Object} dependencies dictionary
         */
        _processDependencies: function (dependencies) {
            this._dependsOn = dependencies[this._name] || [];
            this._dependencyOf = [];
            Object.keys(dependencies).forEach(function (name) {
                var nameDependencies = dependencies[name];
                if (nameDependencies.indexOf(this._name) !== NOT_FOUND) {
                    this._dependencyOf.push(name);
                }
            }, this);
        },

        /**
         * Change the test setting
         *
         * @param {Boolean} value New value for test
         * @return {Boolean} Update done
         */
        _setTest: function (value) {
            this._test = value;
            return true;
        },

        /** Checked state (exists, obsolete, new) */
        _checkedState: "",

        /**
         * Create the exported version of the source
         *
         * @return {Object} Object to be converted to JSON and saved
         */
        "export": function () {
            var result = {
                name: this._name
            };
            if (!this._test) {
                result.test = false;
            }
            if (this._tags.length) {
                result.tags = this._tags.join(" ");
            }
            return result;
        },

        isReadOnly: function () {
            return this._name === "boot";
        },

        testProperty: function (propertyName) {
            if (propertyName === "test") {
                return this._test;
            }
            return true;
        },

        setProperty: function (propertyName, value) {
            if (propertyName === "test") {
                return this._setTest(value);
            }
        },

        hasDependencies: function () {
            return Boolean(this._dependsOn.length);
        },

        isReferenced: function () {
            return Boolean(this._dependencyOf.length);
        },

        setCheckedState: function (checkedState) {
            this._checkedState = checkedState;
        },

        getCheckedState: function () {
            return this._checkedState;
        }

    });

});
