"use strict";

/*
 * Handle #if / #else / #endif comments
 * Substitute _gpfSyncReadSourceJSON with content from the JSON file
 */

const
    fs = require("fs"),
    or = (previousValue, currentValue) => previousValue || currentValue;

class Preprocessor {

    constructor (src, defines) {
        this._lines = src.split("\n");
        this._defines = defines;
        this._ignoreStack = [];
    }

    _searchForMatch (line) {
        return !Object.keys(Preprocessor.tags).every(match => {
            if (line.indexOf(match) > -1) {
                Preprocessor.tags[match].call(this, line);
                return false;
            }
            return true;
        });
    }

    getOutput () {
        let lines = this._lines,
            length = lines.length,
            idx,
            line,
            matched;
        for (idx = 0; idx < length; ++idx) {
            line = lines[idx];
            matched = this._searchForMatch(line);
            if (matched || this._ignoreStack.reduce(or, false)) {
                lines.splice(idx, 1);
                --length;
                --idx;
            }
        }
        return this._lines.join("\n");
    }
}

Preprocessor.tags = {

    "/*#if": function (line) {
        /*jshint validthis:true*/ // Called with the context of Preprocessor
        let invert = line.indexOf("/*#ifndef(") > -1,
            define = line.split("(")[1].split(")")[0],
            ignore;
        ignore = !this._defines[define];
        if (invert) {
            ignore = !ignore;
        }
        this._ignoreStack.unshift(ignore);
    },

    "/*#else": function (/*line*/) {
        /*jshint validthis:true*/ // Called with the context of Preprocessor
        if (this._ignoreStack.length) {
            this._ignoreStack[0] = !this._ignoreStack[0];
        }
    },

    "/*#endif": function (/*line*/) {
        /*jshint validthis:true*/ // Called with the context of Preprocessor
        this._ignoreStack.shift();
    }

};

// Preprocess the JavaScript source and resolve the #ifdef macros
module.exports = (src, defines) => {
    let preprocessor = new Preprocessor(src, defines);
    return preprocessor.getOutput().replace(/_gpfSyncReadSourceJSON\("([^"]+)"\)/g, (match, jsonFileName) =>
        fs.readFileSync("../src/" + jsonFileName).toString()
    );
};
