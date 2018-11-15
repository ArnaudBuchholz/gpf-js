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
            if (line.includes(match)) {
                Preprocessor.tags[match].call(this, line);
                return false;
            }
            return true;
        });
    }

    getOutput () {
        const REMOVE_ITEM = 1;
        let lines = this._lines,
            length = lines.length,
            idx = 0,
            line,
            matched;
        while (idx < length) {
            line = lines[idx];
            matched = this._searchForMatch(line);
            if (matched || this._ignoreStack.reduce(or, false)) {
                lines.splice(idx, REMOVE_ITEM);
                --length;
            } else {
                ++idx;
            }
        }
        return this._lines.join("\n");
    }
}

Preprocessor.tags = {

    "/*#if": function (line) {
        /*jshint validthis:true*/ // Called with the context of Preprocessor
        const
            match = (/\/\*#if(n)?def\(([\w_]+)\)/).exec(line),
            INVERTED = 1,
            NAME = 2;
        let ignore = !this._defines[match[NAME]];
        if (match[INVERTED]) {
            ignore = !ignore;
        }
        this._ignoreStack.unshift(ignore);
    },

    "/*#else": function (/*line*/) {
        /*jshint validthis:true*/ // Called with the context of Preprocessor
        if (this._ignoreStack.length) {
            this._ignoreStack.unshift(!this._ignoreStack.shift());
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
