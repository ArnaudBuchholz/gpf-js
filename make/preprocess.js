"use strict";

function Preprocessor (src, defines) {
    this._lines = src.split("\n");
    this._defines = defines;
    this._ignoreStack = [];
}

Preprocessor.tags = {

    "/*#if": function (line) {
        /*jshint validthis:true*/ // Called with the context of Preprocessor
        var invert = -1 < line.indexOf("/*#ifndef("),
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

function or (previousValue, currentValue) {
    return previousValue || currentValue;
}

Preprocessor.prototype = {

    // @property {String[]} lines
    _lines: [],

    // Defines
    _defines: {},

    // @property {Boolean[]}
    _ignoreStack: [false],

    _searchForMatch: function (line) {
        var match;
        for (match in Preprocessor.tags) {
            if (Preprocessor.tags.hasOwnProperty(match)) {
                if (-1 < line.indexOf(match)) {
                    Preprocessor.tags[match].apply(this, [line]);
                    return true;
                }
            }
        }
    },

    getOutput: function () {
        var lines = this._lines,
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
};

/**
 * Preprocess the JavaScript source and resolve the #ifdef macros
 *
 * @param {String} src
 * @param {Object} defines Dictionary of defines
 * @return {String}
 */
module.exports = function (src, defines) {
    var preprocessor = new Preprocessor(src, defines);
    return preprocessor.getOutput();
};
