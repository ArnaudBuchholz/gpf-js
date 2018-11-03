gpf.require.define({
    dialogs: "../dialogs.js",
    Source: "source.js",
    sources: "../../src/sources.json",
    dependencies: "../../build/dependencies.json"

}, function (require) {
    "use strict";

    var dialogs = require.dialogs,
        Source = require.Source;

    //region Source and SourceArray definitions
    return gpf.define({
        $class: "SourceArray",

        constructor: function () {
            require.sources.forEach(function (source) {
                this._sources.push(new Source(this, source, require.dependencies));
            }, this);
        },

        /** Array of sources */
        _sources: [],

        /**
         * Result of check function
         *
         * @type {Object}
         */
        _checkDictionary: null,

        // Update source with external properties
        _update: function (source) {
            var me = this;
            if (me._checkDictionary) {
                source.setCheckedState(me._checkDictionary[source.getName()]);
            }
            return source;
        },

        /**
         * Get the number of sources
         *
         * @return {Number} Number of sources
         */
        getLength: function () {
            return this._sources.length;
        },

        /**
         * Enumerate all sources
         *
         * @param {Function} callback Called on each source
         * @param {*} thisArg This context
         */
        forEach: function (callback, thisArg) {
            var me = this;
            this._sources.forEach(function (source, index) {
                callback(me._update(source), index);
            }, thisArg);
        },

        /**
         * Get the source by name
         *
         * @param {String} name Name of the source name to retreive
         * @return {Source|undefined} Source which name matches the parameter
         */
        byName: function (name) {
            var result;
            this._sources.every(function (source) {
                if (source.getName() === name) {
                    result = this._update(source);
                    return false;
                }
                return true;
            }, this);
            return result;
        },

        /**
         * Get the source by index
         *
         * @param {Number} index Index of the source inside the array
         * @return {Source} Source which index matches the parameter
         */
        byIndex: function (index) {
            return this._update(this._sources[index]);
        },

        /**
         * Get all module names
         *
         * @return {String[]} Get all source names
         */
        getNames: function () {
            return this._sources.map(function (source) {
                return source.getName();
            });
        },

        /**
         * Based on its dependencies, compute the minimum index of the module.
         *
         * @param {String} name Source Name
         * @return {Number} Source index before which the source can't be moved
         */
        getMinIndexFor: function (name) {
            var dependencies = this.byName(name).getDependencies(),
                names = this.getNames(),
                minIndex = 1; // 0 being boot
            dependencies.forEach(function (dependencyName) {
                var index = names.indexOf(dependencyName) + 1;
                if (index > minIndex) {
                    minIndex = index;
                }
            });
            return minIndex;
        },

        /**
         * Return the JSON string representing the list of sources
         *
         * @return {String} JSON export of the sources array
         */
        toString: function () {
            return JSON.stringify(this._sources.map(function (source) {
                return source["export"]();
            }), null, "    ");
        },

        /**
         * Once the sources list is modified, rebuild the list of indexes
         *
         * @private
         */
        _rebuildSourcesIndex: function () {
            this._sources.forEach(function (source, index) {
                source.setIndex(index);
            });
        },

        /**
         * Moves source after the referenced one
         *
         * @param {String} sourceName Name of the source to move
         * @param {String} referenceSourceName Name of the source to be used as a position reference
         */
        insertAfter: function (sourceName, referenceSourceName) {
            var sourceToMove,
                sourcePos,
                referenceSourcePos;
            if (!this._sources.every(function (source, index) {
                var name = source.getName();
                if (name === sourceName) {
                    sourceToMove = source;
                    sourcePos = index;
                } else if (name === referenceSourceName) {
                    referenceSourcePos = index;
                }
                return sourcePos === undefined || referenceSourcePos === undefined;
            })) {
                this._sources.splice(sourcePos, 1);
                if (sourcePos > referenceSourcePos) {
                    ++referenceSourcePos;
                }
                this._sources.splice(referenceSourcePos, 0, sourceToMove);
                this._rebuildSourcesIndex();
            }
        },

        /**
         * Remove the source from the array
         *
         * @param {Source} obsoleteSource Source to remove
         */
        remove: function (obsoleteSource) {
            this._sources = this._sources.filter(function (source) {
                return obsoleteSource !== source;
            });
            this._rebuildSourcesIndex();
        },

        /**
         * Provide information about sources
         *
         * @param {Object} checkDictionary Result of the check mechanism
         */
        setCheckDictionary: function (checkDictionary) {
            this._checkDictionary = checkDictionary;
            var newSources = Object.keys(checkDictionary)
                .filter(function (name) {
                    return checkDictionary[name] === "new";
                })
                .map(function (name) {
                    return new Source(this, {
                        name: name,
                        load: false
                    }, null);
                }, this);
            // Add missing sources after the last loaded one
            if (newSources.length > 0) {
                var lastLoadedSource = this._sources.length;
                this._sources.every(function (source, index) {
                    if (index && !source.getLoad()) { // Skip boot
                        lastLoadedSource = index + 1;
                        return false;
                    }
                    return true;
                });
                this._sources.splice.apply(this._sources, [lastLoadedSource, 0].concat(newSources));
            }
        },

        /**
         * Save to src/sources.json
         *
         * @return {Promise} Resolved when saved
         */
        save: function () {
            return gpf.http.post("/fs/src/sources.json", this.toString())
                .then(function (answer) {
                    var HTTP_ERROR = 500;
                    if (answer.status === HTTP_ERROR) {
                        return dialogs.error(answer.responseText);
                    }
                });
        }

    });

});
