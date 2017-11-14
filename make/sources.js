"use strict";
/*global xhr*/
/*jshint browser: true*/
/*eslint-env browser*/
/*eslint-disable no-alert*/

function showError (message) {
    alert(message);
}

//region Source and SourceArray definitions

function Source (array, source, dependencies) {
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
}

Source.prototype = {

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
    _index: -1,

    /** @gpf:read _index */
    getIndex: function () {
        return this._index;
    },

    /** @gpf:write _index */
    setIndex: function (value) {
        this._index = value;
    },

    /** Source is loaded */
    _load: false,

    /** @gpf:read _load */
    getLoad: function () {
        return this._load;
    },

    /** Source has a test counterpart */
    _test: false,

    /** @gpf:read _test */
    getTest: function () {
        return this._test;
    },

    /** Documentation should be extracted from this source */
    _doc: false,

    /** @gpf:read _doc */
    getDoc: function () {
        return this._doc;
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
            if (nameDependencies.indexOf(this._name) > -1) {
                this._dependencyOf.push(name);
            }
        }, this);
    },

    /**
     * Change the load setting
     *
     * @param {Boolean} value New value for the setting
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
     * @param {Boolean} value New value for test
     * @return {Boolean} Update done
     */
    _setTest: function (value) {
        this._test = value;
        return true;
    },

    /**
     * Change the doc setting
     *
     * @param {Boolean} value New value for doc
     * @return {Boolean} Update done
     */
    _setDoc: function (value) {
        this._doc = value;
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
            return this._setDoc(value);
        }
    },

    hasDependencies: function () {
        return this._dependsOn.length > 0;
    },

    isReferenced: function () {
        return this._dependencyOf.length > 0;
    },

    setCheckedState: function (checkedState) {
        this._checkedState = checkedState;
    },

    getCheckedState: function () {
        return this._checkedState;
    }

};

function SourceArray (sourcesJSON, dependenciesJSON) {
    var dependencies = JSON.parse(dependenciesJSON);
    JSON.parse(sourcesJSON).forEach(function (source) {
        this._sources.push(new Source(this, source, dependencies));
    }, this);
}

SourceArray.prototype = {

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
        }), null, 4);
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
                return "new" === checkDictionary[name];
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

    /** Save to src/sources.json */
    save: function () {
        xhr("/fs/src/sources.json").put(this.toString())
            .then(undefined, showError);
    }

};

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
            }, function () {
                // TODO find a better way
                source._test = false;
            });
    }

    xhr("/src/" + name + ".js").get().then(function (content) {
        var description = (/@file (.*)/).exec(content);
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

function onDelete (source) {
    if (!source.isReadOnly() && !source.getLoad() && confirm("Delete '" + source.getName() + "' ?")) {
        sources.remove(source);
        sources.save();
        var name = source.getName();
        xhr("/fs/src/" + name + ".js")["delete"](); // Ignore error
        if (source.getTest()) {
            xhr("/fs/test/" + name + ".js")["delete"](); // Ignore error
        }
        reload();
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
    } else if (-1 !== target.className.indexOf("delete")) {
        onDelete(source);
    }
}

//region Drag & Drop

var draggedSourceName;

(function (events) {
    Object.keys(events).forEach(function (eventName) {
        var handler = events[eventName];
        function eventListener (event) {
            var targetRow = upToSourceRow(event.target);
            if (targetRow) {
                handler(event, targetRow);
            }
        }
        window.addEventListener(eventName, eventListener);
    });

}({

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

}));

//endregion

//region Compare sources.json with repository

function compare (checkDictionary, path, pathContent) {
    var subPromises = [];
    pathContent.forEach(function (name) {
        var contentFullName = path + name,
            contentFullNameLength = contentFullName.length;
        if (contentFullNameLength > 3 && contentFullName.indexOf(".js") === contentFullNameLength - 3) {
            contentFullName = contentFullName.substr(0, contentFullNameLength - 3);
            if ("obsolete" === checkDictionary[contentFullName]) {
                checkDictionary[contentFullName] = "exists";
            } else {
                checkDictionary[contentFullName] = "new";
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
    }
    return Promise.all(subPromises);
}

function check () {
    var checkDictionary = {};
    sources.forEach(function (source) {
        checkDictionary[source.getName()] = "obsolete";
    });
    xhr("/fs/src").get().asJson()
        .then(function (pathContent) {
            return compare(checkDictionary, "", pathContent);
        })
        .then(function () {
            sources.setCheckDictionary(checkDictionary);
            reload();
        });
}

//endregion

window.addEventListener("load", function () {
    Promise.all([xhr("/src/sources.json").get(), xhr("/build/dependencies.json").get()])
        .then(function (responseTexts) {
            var tplRow = document.getElementById("tpl_row");
            rowFactory = tplRow.buildFactory();
            sourceRows = document.getElementById("rows");
            sources = new SourceArray(responseTexts[0], responseTexts[1]);
            reload();
            document.addEventListener("click", onClick);
        }, function (reason) {
            showError("A problem occurred while loading src/sources.json and build/dependencies.json: " + reason);
        });

    document.getElementById("save").addEventListener("click", function () {
        sources.save();
    });
    document.getElementById("check").addEventListener("click", check);

});

//endregion
