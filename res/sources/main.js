gpf.require.define({
    dialogs: "../dialogs.js",
    dom: "../dom.js",
    SourceArray: "array.js",
    dependencyWheel: "dependencyWheel.js",
    flavor: "flavor.js",
    dependencies: "../../build/dependencies.json"

}, function (require) {
    "use strict";

    var NOT_FOUND = -1,
        START = 0,
        dialogs = require.dialogs,
        dom = require.dom,
        flavor = require.flavor,
        SourceArray = require.SourceArray,
        // {Function} Row factory
        rowFactory = document.getElementById("tpl_row").buildFactory(),
        // {Object} Base node receiving rows
        sourceRows = document.getElementById("rows"),
        // {SourceArray} List of sources
        sources = new SourceArray();

    //region HTML page logic

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

        if (name.indexOf("host/") !== START) {
            gpf.http.options("/fs/test/" + name + ".js")
                .then(function (response) {
                    var HTTP_OK = 200;
                    if (response.status === HTTP_OK) {
                        document.getElementById("test_" + index).className = "";
                    } else {
                        source._test = false;
                    }
                });
        }

        gpf.http.get("/src/" + name + ".js")
            .then(function (response) {
                var match = (/@file (.*)/).exec(response.responseText),
                    DESCRIPTION = 1;
                if (match) {
                    document.getElementById(name).title = match[DESCRIPTION];
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
            if (flavor && !flavor[index]) {
                return;
            }
            sourceRows.appendChild(rowFactory(source, index));
            updateSourceRow(source);
        });
    }

    function onCheckboxClick (checkbox, source) {
        var property = checkbox.id.split("_")[START];
        if (source.setProperty(property, checkbox.checked)) {
            refreshSourceRow(checkbox, source);
        } else {
            checkbox.checked = !checkbox.checked; // Restore value
        }
    }

    function onDelete (source) {
        if (!source.isReadOnly()) {
            dialogs.confirm("Delete '" + source.getName() + "' ?")
                .then(function (ok) {
                    if (!ok) {
                        return;
                    }
                    sources.remove(source);
                    sources.save();
                    var name = source.getName();
                    gpf.http["delete"]("/fs/src/" + name + ".js");
                    gpf.http["delete"]("/fs/test/" + name + ".js");
                    reload();
                });
        }
    }

    //region Drag & Drop

    var draggedSourceName;

    (function (events) {
        Object.keys(events).forEach(function (eventName) { // eslint-disable-line max-nested-callbacks
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
            if (targetRow.className.indexOf("drag-ok") !== NOT_FOUND) {
                event.preventDefault(); // allowed
            }
        },

        dragenter: function (event, targetRow) {
            if (targetRow.className.indexOf(" over") === NOT_FOUND) {
                targetRow.className += " over";
            }
        },

        dragleave: function (event, targetRow) {
            if (targetRow.className.indexOf(" over") !== NOT_FOUND) {
                targetRow.className = targetRow.className.split(" ")[START];
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
            var JS_EXT = ".js",
                JS_EXT_LENGTH = JS_EXT.length,
                contentFullName = path + name,
                contentFullNameLength = contentFullName.length;
            if (contentFullNameLength > JS_EXT_LENGTH
                && contentFullName.indexOf(JS_EXT) === contentFullNameLength - JS_EXT_LENGTH) {
                contentFullName = contentFullName.substring(START, contentFullNameLength - JS_EXT_LENGTH);
                if (checkDictionary[contentFullName] === "obsolete") {
                    checkDictionary[contentFullName] = "exists";
                } else {
                    checkDictionary[contentFullName] = "new";
                }
            } else if (name.indexOf(".") === NOT_FOUND) {
                subPromises.push(gpf.http.get("/fs/src/" + contentFullName)
                    .then(function (response) {
                        return JSON.parse(response.responseText);
                    })
                    .then(function (subPathContent) {
                        return compare(checkDictionary, contentFullName + "/", subPathContent);
                    }));
            }
        });
        if (!subPromises.length) {
            return Promise.resolve();
        }
        return Promise.all(subPromises);
    }

    //endregion

    reload();

    dom.addEventsListener({
        "@click": function (event) {
            var target = event.target,
                sourceRow = upToSourceRow(target),
                source;
            if (!sourceRow) {
                return;
            }
            source = sources.byName(sourceRow.id);
            if (target.getAttribute("type") === "checkbox") {
                onCheckboxClick(target, source);
            } else if (target.className.indexOf("delete") !== NOT_FOUND) {
                onDelete(source);
            }
        },

        "#save@click": function () {
            sources.save();
        },

        "#check@click": function () {
            var checkDictionary = {};
            sources.forEach(function (source) {
                checkDictionary[source.getName()] = "obsolete";
            });
            gpf.http.get("/fs/src")
                .then(function (response) {
                    return JSON.parse(response.responseText);
                })
                .then(function (pathContent) {
                    return compare(checkDictionary, "", pathContent);
                })
                .then(function () {
                    sources.setCheckDictionary(checkDictionary);
                    reload();
                });
        },

        "#flavor@click": function () {
            dialogs.prompt("Enter flavor request", "require host:nodejs host:browser -http/nodejs")
                .then(function (flavorDescription) {
                    if (flavorDescription) {
                        location.search = flavorDescription;
                    } else {
                        location.search = "";
                    }
                });
        }

    });

});
