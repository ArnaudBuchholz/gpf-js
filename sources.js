"use strict";
/*global xhr*/

//region Source and SourceArray definitions

var Source = gpf.define("Source", {

    "private": {

        //@property {SourceArray} Source array
        _array: null,

        //@property {String} Source name
        "[_name]": [gpf.$ClassProperty()],
        _name: "",

        //@property {Number} Source index
        "[_index]": [gpf.$ClassProperty(true)],
        _index: -1,

        //@property {Boolean} Source is loaded
        "[_load]": [gpf.$ClassProperty()],
        _load: false,

        //@property {Boolean} Source has a test counterpart
        "[_test]": [gpf.$ClassProperty()],
        _test: false,

        //@property {Boolean} Documentation should be extracted from this source
        "[_doc]": [gpf.$ClassProperty()],
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
            this._dependsOn = dependencies[this._name] || [];
            this._dependencyOf = [];
            Object.keys(dependencies).forEach(function (name) {
                var nameDependencies = dependencies[name];
                if (nameDependencies.indexOf(this._name) > -1) {
                    this._dependencyOf.push(name);
                }
            }, this);
        },

        /**
         * Change the load setting
         *
         * @param {Boolean} value
         * @return {Boolean} Update done
         */
        _setLoad: function (value) {
            if (!value) {
                // Allow only if all dependencies are not loaded
                if (this._dependencyOf.some(function (name) {
                    return this._array.byName(name).getLoad();
                }, this)) {
                    return false;
                }
            }
            this._load = value;
            return true;
        },

        /**
         * Change the load setting
         *
         * @param {Boolean} value
         * @return {Boolean} Update done
         */
        _setTest: function (value) {
            this._test = value;
            return true;
        },

        /**
         * Change the doc setting
         *
         * @param {Boolean} value
         * @return {Boolean} Update done
         */
        _setDoc: function (value) {
            this._doc = value;
            return true;
        }

    },

    "public": {

        constructor: function (array, source, dependencies) {
            this._array = array;
            this._name = source.name;
            this._index = array.getLength();
            if (source.load !== false) {
                this._load = true;
            }
            if (source.test !== false) {
                this._test = true;
            }
            if (source.doc) {
                this._doc = true;
            }
            if (dependencies) {
                this._processDependencies(dependencies);
            }
        },

        /**
         * Create the exported version of the source
         */
        export: function () {
            var result = {
                name: this._name
            };
            if (this._load) {
                if (!this._test) {
                    result.test = false;
                }
                if (this._doc) {
                    result.doc = true;
                }
            } else {
                result.load = false;
            }
            return result;
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
                return this._setLoad(value);
            }
            if ("test" === propertyName) {
                return this._setTest(value);
            }
            if ("doc" === propertyName) {
                this._setDoc(value);
            }
        },

        hasDependencies: function () {
            return this._dependsOn.length > 0;
        },

        isReferenced: function () {
            return this._dependencyOf.length > 0;
        }

    }

});

var SourceArray = gpf.define("SourceArray", {

    "private": {

        // @property {Object} dictionary of sources indexed by name
        _sources: [],

        // @property {Object} Result of check function
        _checkDictionary: null,

        // Adds extra properties to the source
        _extend: function (source) {
            var me = this,
                result;
            if (me._checkDictionary) {
                result = Object.create(source);
                result.getCheckedState = function () {
                    return me._checkDictionary[source.getName()];
                };
                return result;
            }
            return source;
        }

    },

    "public": {

        constructor: function (sourcesJSON, dependenciesJSON) {
            var dependencies = JSON.parse(dependenciesJSON);
            JSON.parse(sourcesJSON).forEach(function (source) {
                this._sources.push(new Source(this, source, dependencies));
            }, this);
        },

        /**
         * Get the number of sources
         *
         * @return {Number}
         */
        getLength: function () {
            return this._sources.length;
        },

        /**
         * Enumerate all sources
         *
         * @param {Function} callback
         * @param {*} thisArg
         */
        forEach: function (callback, thisArg) {
            var that = this;
            this._sources.forEach(function (source, index) {
                callback(that._extend(source), index);
            }, thisArg);
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
                    result = this._extend(source);
                    return false;
                }
                return true;
            }, this);
            return result;
        },

        /**
         * Get the source by index
         *
         * @param {Number} index
         * @return {Source}
         */
        byIndex: function (index) {
            return this._extend(this._sources[index]);
        },

        /**
         * Get all module names
         *
         * @return {String[]}
         */
        getNames: function () {
            return this._sources.map(function (source) {
                return source.getName();
            });
        },

        /**
         * Based on its dependencies, compute the minimum index of the module.
         *
         * @param {String} name
         * @return {Number}
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
         * @return {String}
         */
        toString: function () {
            return JSON.stringify(this._sources.map(function (source) {
                return source.export();
            }), null, 4);
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
                this._sources.forEach(function (source, index) {
                    source.setIndex(index);
                });
            }
        },

        /**
         * Provide information about sources
         *
         * @param {Object} checkDictionary
         */
        setCheckDictionary: function (checkDictionary) {
            this._checkDictionary = checkDictionary;
            // Add missing sources
            Object.keys(checkDictionary).forEach(function (name) {
                if (undefined === checkDictionary[name]) {
                    this._sources.push(new Source(this, {
                        name: name,
                        load: false
                    }, null));
                }
            }, this);
        }

    }

});

//endregion

//region HTML page logic

var // @global {Function} Row factory
    rowFactory,
    // @global {Object} Base node receiving rows
    sourceRows,
    // @global {SourceArray} List of sources
    sources;

// Whatever the target node, get the parent TR corresponding to the source row
function upToSourceRow (target) {
    var current = target;
    while (current && (!current.tagName || current.tagName.toLowerCase() !== "tr")) {
        current = current.parentNode;
    }
    return current;
}

function updateSourceRow (source) {
    var index = source.getIndex(),
        name = sources.byIndex(index).getName();

    if (0 !== name.indexOf("host/")) {
        xhr("/fs/test/" + name + ".js").options()
            .then(function () {
                document.getElementById("test_" + index).className = "";
            });
    }

    xhr("/src/" + name + ".js").get().then(function (content) {
        var description = /@file (.*)/.exec(content);
        if (description) {
            document.getElementById("description_" + index).innerHTML = description[1];
        }
    });
}

// Regenerate the source row
function refreshSourceRow (target, source) {
    var row = upToSourceRow(target),
        newRow = rowFactory(source, source.getIndex());
    sourceRows.replaceChild(newRow, row);
    updateSourceRow(source);
}

// Regenerate all source rows
function reload () {
    sourceRows.innerHTML = ""; // Clear content
    sources.forEach(function (source, index) {
        sourceRows.appendChild(rowFactory(source, index));
        updateSourceRow(source);
    });
}

function onCheckboxClick (checkbox, source) {
    var property = checkbox.id.split("_")[0];
    if (source.setProperty(property, checkbox.checked)) {
        refreshSourceRow(checkbox, source);
    } else {
        checkbox.checked = !checkbox.checked; // Restore value
    }
}

function onClick (event) {
    var target = event.target,
        sourceRow = upToSourceRow(target),
        source;
    if (!sourceRow) {
        return;
    }
    source = sources.byName(sourceRow.id);
    if ("checkbox" === target.getAttribute("type")) {
        onCheckboxClick(target, source);

    }
}

//region Drag & Drop

var draggedSourceName;

gpf.forEach({

    drag: function (event, targetRow) {
        if (draggedSourceName === targetRow.id) {
            return;
        }
        draggedSourceName = targetRow.id;
        var minIndex = sources.getMinIndexFor(draggedSourceName);
        [].slice.call(sourceRows.children).forEach(function (sourceRow, index) {
            if (sourceRow === event.target) {
                sourceRow.className = "dragged";
            } else if (index < minIndex) {
                sourceRow.className = "no-drag";
            } else {
                sourceRow.className = "drag-ok";
            }
        });
    },

    dragend: function (/*event*/) {
        // clean-up classes
        [].slice.call(sourceRows.children).forEach(function (sourceRow) {
            sourceRow.className = "";
        });
    },

    dragover: function (event, targetRow) {
        if (-1 < targetRow.className.indexOf("drag-ok")) {
            event.preventDefault(); // allowed
        }
    },

    dragenter: function (event, targetRow) {
        if (-1 === targetRow.className.indexOf(" over")) {
            targetRow.className += " over";
        }
    },

    dragleave: function (event, targetRow) {
        if (-1 !== targetRow.className.indexOf(" over")) {
            targetRow.className = targetRow.className.split(" ")[0];
        }
    },

    drop: function (event, targetRow) {
        sources.insertAfter(draggedSourceName, targetRow.id);
        reload();
        draggedSourceName = undefined;
        event.preventDefault();
    }

}, function (handler, eventName) {
    window.addEventListener(eventName, function (event) {
        var targetRow = upToSourceRow(event.target);
        if (targetRow) {
            handler(event, targetRow);
        }
    });
});

//endregion

//region Compare sources.json with repository

function compare (checkDictionary, path, pathContent) {
    var subPromises = [];
    pathContent.forEach(function (name) {
        var contentFullName = path + name,
            contentFullNameLength = contentFullName.length;
        if (contentFullNameLength > 3 && contentFullName.indexOf(".js") === contentFullNameLength - 3) {
            contentFullName = contentFullName.substr(0, contentFullNameLength - 3);
            if (false === checkDictionary[contentFullName]) {
                checkDictionary[contentFullName] = true;
            } else {
                checkDictionary[contentFullName] = undefined; // missing
            }
        } else if (-1 === name.indexOf(".")) {
            subPromises.push(xhr("/fs/src/" + contentFullName).get().asJson()
                .then(function (subPathContent) {
                    return compare(checkDictionary, contentFullName + "/", subPathContent);
                }));
        }
    });
    if (0 === subPromises.length) {
        return Promise.resolve();
    } else {
        return Promise.all(subPromises);
    }
}

function check () {
    var checkDictionary = {};
    sources.forEach(function (source) {
        checkDictionary[source.getName()] = false;
    });
    xhr("/fs/src").get().asJson()
        .then(function (pathContent) {
            return compare(checkDictionary, "", pathContent);
        })
        .then(function () {
            var obsoleteSources = [],
                newSources = [];
            gpf.forEach(checkDictionary, function (status, name) {
                if (false === status) {
                    obsoleteSources.push(name);
                } else if (undefined === status) {
                    newSources.push(name);
                }
            });
            sources.setCheckDictionary(checkDictionary);
            reload();
        });
}

//endregion

window.addEventListener("load", function () {
    Promise.all([xhr("src/sources.json").get(), xhr("build/dependencies.json").get()])
        .then(function (responseTexts) {
            var tplRow = document.getElementById("tpl_row");
            rowFactory = tplRow.buildFactory();
            sourceRows = document.getElementById("rows");
            sources = new SourceArray(responseTexts[0], responseTexts[1]);
            reload();
            document.addEventListener("click", onClick);
        }, function (reason) {
            alert("A problem occurred while loading src/sources.json and build/dependencies.json: " + reason);
        });

    document.getElementById("save").addEventListener("click", function () {
        xhr("/fs/src/sources.json").put(sources.toString())
            .then(undefined, function (reason) {
                alert(reason);
            });
    });

    document.getElementById("check").addEventListener("click", check);

});

//endregion
