"use strict";

var fs = require("fs");

var sources = JSON.parse(fs.readFileSync("./src/sources.json"))
    .filter(function (source) {
        return source.load !== false;
    })
    .map(function (source) {
        return source.name;
    });
sources.unshift("boot"); // Also include boot

var rc = 0,
    rewrites = {};

function Module (name) {
    this.name = name;
    Module.byName[name] = this;
    this.lines = fs.readFileSync("./src/" + name + ".js").toString().split("\n");
    this.imports = [];
    this.writableImport = {};
    this.exports = {};
    this.filteredLines = [];
}

Module.prototype = {
    // @property {String} Module name
    name: "",

    // @property {String[]} Content lines
    lines: [],

    // @property {String[]} Imported symbols
    imports: [],

    // @property {Object} Imported symbols is read-only (false/undefined) or modifiable (true)
    writableImport: {},

    // @property {Object} Dictionary of exported symbols mapping to their description
    exports: {},

    // @property {Number[]} Lines containing import/export definition
    filteredLines: [],

    // Log an error
    error: function (text) {
        console.error("[" + this.name + "] " + text);
        --rc;
    },

    // Analyze the file content
    analyze: function () {
        this.lines.every(this._dispatchLine, this);
    },

    // Select method for the given line
    _dispatchLine: function (line, lineIndex) {
        if (0 === lineIndex) {
            return this._checkLine0(line);
        }
        if (1 === lineIndex) {
            return this._checkLine1(line);
        }
        if (line === "/*#endif*/") {
            return false; // Stop
        }
        return this._analyzeLine(line, lineIndex);
    },

    // First line *must* be /*#ifndef(UMD)*/
    _checkLine0: function (line) {
        if (line !== "/*#ifndef(UMD)*/") {
            module.error("missing /*#ifndef(UMD)*/");
            return false;
        }
        return true;
    },

    // Second line *must* be "use strict";
    _checkLine1: function (line) {
        if (line !== "\"use strict\";") {
            module.error("missing \"use strict\";");
            return false;
        }
        return true;
    },

    // Content line: select the proper handling
    _analyzeLine: function (line, lineIndex) {
        if (0 === line.indexOf("/*global ")) {
            return this._processImport(line, lineIndex);
        }
        if (0 === line.indexOf("/*exported ")) {
            return this._processExport(line, lineIndex);
        }
        if (-1 < line.indexOf("eslint") || -1 < line.indexOf("jshint")) {
            // ignore
            return true;
        }
        this.error("line " + (lineIndex + 1) + " not recognized");
        return false;
    },

    // global found
    _processImport: function (line, lineIndex) {
        var name = line.split("*/")[0].substr(9).trim(),
            modifiable;
        if (name.indexOf(":")) {
            name = name.split(":");
            modifiable = name[1] === "true";
            name = name[0];
            this.writableImport[name] = modifiable;
        }
        this.imports.push(name);
        this.filteredLines.push(lineIndex);
        return true;
    },

    // exported found
    _processExport: function (line, lineIndex) {
        var name = line.split("*/")[0].substr(11).trim(),
            description = line.split("// ")[1] || "";
        if (!description) {
            this.error("no description for " + name);
        }
        this.exports[name] = description;
        Module.byExport[name] = this;
        this.filteredLines.push(lineIndex);
        return true;
    },

    // returns true if modified
    rebuild: function () {
        var before = this.lines.join("\n"),
            lines = this.lines.filter(function (line, lineIndex) {
                return -1 === this.filteredLines.indexOf(lineIndex);
            }, this),
            spliceArgs = [2, 0],
            after;
        this.imports.sort().forEach(function (name) {
            var module = Module.byExport[name];
            if (undefined === module) {
                this.error("No export for '" + name + "'");
                return;
            }
            var global = "/*global " + name;
            if (this.writableImport[name]) {
                global += ":true";
            }
            global += "*/ // " + module.exports[name];
            spliceArgs.push(global);
        }, this);
        Object.keys(this.exports).sort().forEach(function (name) {
            var exported = "/*exported " + name + "*/ // " + this.exports[name];
            spliceArgs.push(exported);
        }, this);
        [].splice.apply(lines, spliceArgs);
        after = lines.join("\n");
        if (before !== after) {
            rewrites[this.name] = after;
            return true;
        }
        return false;
    }

};

Module.byName = {};
Module.byExport = {};

// Collect information
sources.every(function (source) {
    if (source === "") {
        return false;
    }
    var module = new Module(source);
    module.analyze();
    return true;
});

// Rebuild - if necessary
sources.every(function (source) {
    if (source === "") {
        return false;
    }
    var module = Module.byName[source];
    if (module.rebuild()) {
        console.log(source);
    }
    return true;
});

function rewriteAll () {
    var name;
    for (name in rewrites) {
        if (rewrites.hasOwnProperty(name)) {
            fs.writeFileSync("./src/" + name + ".js", rewrites[name]);
        }
    }
}

if (0 === rc) {
    rewriteAll();
}

// Generates dependency graph
var dependencies = {};
sources.every(function (source) {
    if (source === "") {
        return false;
    }
    var module = Module.byName[source],
        dependsOn;
    if (module.imports.length) {
        dependsOn = [];
        module.imports.forEach(function (name) {
            var depOnModuleName = Module.byExport[name].name;
            if ("boot" !== depOnModuleName && dependsOn.indexOf(depOnModuleName) === -1) {
                dependsOn.push(depOnModuleName);
            }
        });
        if (dependsOn.length > 0) {
            dependencies[source] = dependsOn;
        } 
    }
    return true;
});
fs.writeFileSync("./build/dependencies.json", JSON.stringify(dependencies, null, 4));

process.exit(rc);
