/*jshint node: true*/
/*eslint-env node*/
/*eslint-disable no-sync*/
"use strict";

var fs = require("fs");

// Get gpf library source
require("../src/sources.js");
var sources = gpf.sources();
sources.unshift("boot"); // Also include boot

var rc = 0;

function Module (name) {
    this.name = name;
    Module.byName[name] = this;
    this.lines = fs.readFileSync("./src/" + name + ".js").toString().split("\n");
    this.imports = [];
    this.exports = {};
    this.filteredLines = [];
}

Module.prototype = {
    // @property {String[]} Content lines
    lines: [],

    // @property {String[]} Imported symbols
    imports: [],

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
        var name = line.split("*/")[0].substr(9).trim();
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
            lines = this.lines.map(function (line, lineIndex) {
                return -1 === this.filteredLines.indexOf(lineIndex);
            }, this),
            headerLines = [];
        this.imports.sort().forEach(function (name) {
            var global = "/*global " + name + "*/ // " + Module.byExport[name].exports[name];
            headerLines.push(global);
        });
        Object.keys(this.exports).sort().forEach(function (name) {
            var exported = "/*exported " + name + "*/ // " + this.exports[name];
            headerLines.push(exported);
        });
    }

};

Module.byName = {};
Module.byExport = {};

sources.every(function (source) {
    if (source === "") {
        return false;
    }
    var module = new Module(source);
    module.analyze();
    return true;
});

// Build former constants.js part
sources.every(function (source) {
    if (source === "") {
        return false;
    }
    var module = Module.byName[source],
        regionLines = [
            "//region " + source
        ],
        moduleExports = module.exports,
        names = Object.keys(moduleExports).sort(),
        description,
        global;
    names.forEach(function (name) {
        global = "/*global " + name + "*/";
        description = module.exports[name];
        if (description) {
            global += " // " + description;
        }
        regionLines.push(global);
    });
    if (1 < regionLines.length) {
        regionLines.push("//endregion " + source);
        console.log(regionLines.join("\n"));
    }
    return true;
});
