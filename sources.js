"use strict";
/*global xhr*/
/*exported onDrag, onDragEnd, onDragOver, onDragEnter, onDragLeave, onDrop, onLoad, onSave*/

//region Source and SourceArray definitions

var Source = gpf.define("Source", {

    "private": {

        //@property {SourceArray} Source array
        _array: null,

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
        "[_load]": [gpf.$ClassProperty()],
        _load: false,

        //@property {Boolean} Source has a test counterpart
        "[_test]": [gpf.$ClassProperty()],
        _test: false,

        //@property {Boolean} Documentation should be extracted from this source
        "[_doc]": [gpf.$ClassProperty()],
        _doc: false,

        //@property {String} Namespace
        "[_namespace]": [gpf.$ClassProperty()],
        _namespace: "",

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
         * Adds an implementation item
         *
         * @param {String} type
         * @param {String} name
         */
        _addImplementationItem: function (type, name) {
            if (!this.hasOwnProperty("_items")) {
                this._items = [];
            }
            this._items.push({
                type: type,
                name: name,
                internal: name.charAt(0) === "_"
            });
        },

        /**
         * Extract implementation details
         *
         * @param {Object} source contains raw implementation
         */
        _processImplementation: function (source) {
            gpf.forEach(Source.IMPLEMENTS_MAPPING, function (type, memberName) {
                if (source[memberName]) {
                    this._addImplementationItem(type, source[memberName]);
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
            this._description = source.description;
            this._index = array.getLength();
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

        /**
         * Create the exported version of the source
         */
        export: function () {
            var result = {
                name: this._name
            };
            if (this._description) {
                result.description = this._description;
            }
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
            this._items.forEach(function (item) {
                gpf.forEach(Source.IMPLEMENTS_MAPPING, function (type, memberName) {
                    if (type === item.type) {
                        result[memberName] = item.name;
                    }
                });
            });
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

    },

    "static": {
        IMPLEMENTS_TYPE_NAMESPACE: "namespace",
        IMPLEMENTS_TYPE_METHOD: "method",
        IMPLEMENTS_TYPE_CLASS: "class",
        IMPLEMENTS_TYPE_INTERFACE: "interface",
        IMPLEMENTS_TYPE_MIXIN: "mixin",

        IMPLEMENTS_MAPPING: {}
    }

});

gpf.extend(Source.IMPLEMENTS_MAPPING, {
    "namespace": Source.IMPLEMENTS_TYPE_NAMESPACE,
    "method": Source.IMPLEMENTS_TYPE_METHOD,
    "class": Source.IMPLEMENTS_TYPE_CLASS,
    "interface": Source.IMPLEMENTS_TYPE_INTERFACE,
    "mixin": Source.IMPLEMENTS_TYPE_MIXIN
});

var SourceArray = gpf.define("SourceArray", {

    "private": {

        // @property {Object} dictionary of sources indexed by name
        _sources: []

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
function upToSourceRow(target) {
    var current = target;
    while (current && current.tagName.toLowerCase() !== "tr") {
        current = current.parentNode;
    }
    return current;
}

// Regenerate the source row
function refreshSourceRow(target, source) {
    var row = upToSourceRow(target),
        newRow = rowFactory(source, source.getIndex());
    sourceRows.replaceChild(newRow, row);
}

// Regenerate all source rows
function reload() {
    sources.forEach(function (item, index) {
        sourceRows.appendChild(rowFactory(item, index));
    });
}

function onClick(event) {
    var target = event.target,
        parts,
        source;
    if ("checkbox" === target.getAttribute("type")) {
        parts = target.id.split("_"); // property_sourceIndex
        source = sources.byIndex(parseInt(parts[1], 10));
        if (source.setProperty(parts[0], target.checked)) {
            refreshSourceRow(target, source);
            document.getElementById("save").removeAttribute("disabled");
        } else {
            target.checked = !target.checked; // Restore value
        }
    } else if ("description" === target.className) {
        alert(target.innerHTML); // TODO propose an text field to edit the description
    }
}

var draggedSourceName;

function onDrag(event) {
    if (!event.target.className) {
        draggedSourceName = event.target.id;
        var minIndex = sources.getMinIndexFor(event.target.id);
        [].slice.call(sourceRows.children).forEach(function (sourceRow, index) {
            if (sourceRow === event.target) {
                sourceRow.className = "dragged";
            } else if (index < minIndex) {
                sourceRow.className = "no-drag";
            } else {
                sourceRow.className = "drag-ok";
            }
        });
    }
}

function onDragEnd(/*event*/) {
    [].slice.call(sourceRows.children).forEach(function (sourceRow) {
        sourceRow.className = "";
    });
}

function onDragOver(event) {
    if (-1 < upToSourceRow(event.target).className.indexOf("drag-ok")) {
        event.preventDefault(); // allowed
    }
}

function onDragEnter(event) {
    var row = upToSourceRow(event.target);
    if (-1 === row.className.indexOf(" over")) {
        row.className += " over";
    }
}

function onDragLeave(event) {
    var row = upToSourceRow(event.target);
    if (-1 !== row.className.indexOf(" over")) {
        row.className = row.className.split(" ")[0];
    }
}

function onDrop(event) {
    var targetSource = upToSourceRow(event.target).id;
    console.log(draggedSourceName + " -> " + targetSource);
    event.preventDefault();
}

function onLoad() {
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
}

function onSave() {
    xhr("/file/src/sources.json").put(sources.toString())
        .then(function () {
            document.getElementById("save").setAttribute("disabled", true);
        }, function (reason) {
            alert(reason);
        });
}

//endregion
