"use strict";
/*exported Source, SourceArray*/

var Source = gpf.define("Source", {

    "private": {

        //@property {String} Source name
        "[_name]": [gpf.$ClassProperty()],
        _name: "",

        //@property {String} Source description
        "[_description]": [gpf.$ClassProperty(true)],
        _description: "",

        //@property {Number} Source index
        "[_index]": [gpf.$ClassProperty(true)],
        _index: -1,

        //@property {Boolean} Source is loaded
        "[_load]": [gpf.$ClassProperty(true)],
        _load: false,

        //@property {Boolean} Source has a test counterpart
        "[_test]": [gpf.$ClassProperty(true)],
        _test: false,

        //@property {Boolean} Documentation should be extracted from this source
        "[_doc]": [gpf.$ClassProperty(true)],
        _doc: false,

        //@property {String[]} List of dependencies (boot is excluded)
        "[_dependsOn]": [gpf.$ClassProperty(false, "dependencies")],
        _dependsOn: [],

        //@property {String[]} List of module dependencies
        "[_dependencyOf]": [gpf.$ClassProperty()],
        _dependencyOf: [],

        /**
         * Extract from the dependencies dictionary
         *
         * @param {Object} dependencies dictionary
         */
        _processDependencies: function (dependencies) {
            var myDependencies = dependencies[this._name] || [];
            this._dependsOn = myDependencies;
            this._dependencyOf = [];
            Object.keys(dependencies).forEach(function (name) {
                var nameDependencies = dependencies[name];
                if (nameDependencies.indexOf(this._name) > -1) {
                    this._dependencyOf.push(name);
                }
            }, this);
        },

        //@property {Object[]} List of implemented items
        "[_items]": [gpf.$ClassProperty()],
        _items: [],

        /**
         * Extract implementation details
         *
         * @param {Object} source contains raw implementation
         */
        _processImplementation: function (source) {
            var item = {};
            if (source.method) {
                item.type = Source.IMPLEMENTS_TYPE_METHOD;
                item.name = source.method;
            } else if (source.class) {
                item.type = Source.IMPLEMENTS_TYPE_CLASS;
                item.name = source.class;
            }
            if (item.type) {
                item.internal = item.name.charAt(0) === "_";
                this._items = [item];
            }
        }
    },

    "public": {

        constructor: function (source, index, dependencies) {
            this._name = source.name;
            this._description = source.description;
            this._index = index;
            if (source.load !== false) {
                this._load = true;
            }
            if (source.test !== false) {
                this._test = true;
            }
            if (source.doc === true) {
                this._doc = true;
            }
            this._processImplementation(source);
            this._processDependencies(dependencies);
        },

        isReadOnly: function () {
            return this._name === "boot";
        },

        testProperty: function (propertyName) {
            if (!this._load) {
                return false;
            }
            if ("test" === propertyName) {
                return this._test;
            } else if ("doc" === propertyName) {
                return this._doc;
            }
            return true;
        },

        setProperty: function (propertyName, value) {
            if ("load" === propertyName) {
                this._load = value;
            } else if ("test" === propertyName) {
                this._test = value;
            } else if ("doc" === propertyName) {
                this._doc = value;
            }
        },

        hasDependencies: function () {
            return this._dependsOn.length > 0;
        }

    },

    "static": {
        IMPLEMENTS_TYPE_METHOD: "method",
        IMPLEMENTS_TYPE_CLASS: "class"
    }

});

var SourceArray = gpf.define("SourceArray", {

    "private": {

        // @property {Object} dictionary of sources indexed by name
        _sources: []

    },

    "public": {

        constructor: function (sourcesJSON, dependenciesJSON) {
            var dependencies = JSON.parse(dependenciesJSON);
            JSON.parse(sourcesJSON).forEach(function (source, index) {
                this._sources.push(new Source(source, index, dependencies));
            }, this);
        },

        /**
         * Enumerate all sources
         *
         * @param {Function} callback
         * @param {*} thisArg
         */
        forEach: function (callback, thisArg) {
            this._sources.forEach(callback, thisArg);
        },

        /**
         * Get the source by name
         *
         * @param {String} name
         * @return {Source}
         */
        byName: function (name) {
            var result;
            this._sources.every(function (source) {
                if (source.getName() === name) {
                    result = source;
                    return false;
                }
                return true;
            });
            return result;
        },

        /**
         * Get the source by index
         *
         * @param {Number} index
         * @return {Source}
         */
        byIndex: function (index) {
            return this._sources[index];
        }

    }

});
