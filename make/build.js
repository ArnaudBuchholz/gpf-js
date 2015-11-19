"use strict";
/*jshint node: true*/
/*eslint-env node*/
/*eslint-disable no-sync*/

var fs = require("fs"),
    preprocess = require("./preprocess.js"),
    ast = require("./ast.js");

function clone (obj) {
    return JSON.parse(JSON.stringify(obj));
}

function Builder (sources, parameters, debug) {
    this._sources = sources;
    this._parameters = parameters;
    this._debug = debug;
}

Builder.prototype = {

    // Sources dictionary (name => String)
    _sources: {},

    // Parameters of the build
    _parameters: {},

    // Debug function
    _debug: function () {
    },

    // AST objects (name => Object)
    _asts: {},

    // AST result placeholder
    _placeholder: {},

    // save temporary files
    _save: function (fileName, data) {
        if (this._parameters.saveTemporaryfiles) {
            fs.writeFileSync(this._parameters.temporaryPath + "/" + fileName, data);
        }
    },

    // preprocess source file, convert to AST and reduce it if necessary
    _toAst: function (name) {
        this._debug("\tConverting " + name + " to AST...");
        var source = this._sources[name],
            astObject;
        source = this._preProcess(source, name);
        this._save(name + ".js", source);
        astObject = this._transform(source, name);
        this._save(name + ".ast.json", JSON.stringify(astObject));
        if (this._parameters.reduce) {
            astObject = this._reduce(astObject);
            this._save(name + ".ast.reduced.json", JSON.stringify(astObject));
            this._save(name + ".ast.reduced.js", ast.rewrite(astObject, this._parameters.debugRewriteOptions));
        }
        this._asts[name] = astObject;
        return astObject;
    },

    _preProcess: function (source, name) {
        try {
            preprocess(source, this._parameters.define);
        } catch (e) {
            e.sourceName = name;
            e.step = "preprocess";
            throw e;
        }
    },

    _transform: function (source, name) {
        try {
            return ast.transform(source);
        } catch (e) {
            e.sourceName = name;
            e.step = "ast.transform";
            throw e;
        }
    },

    _reduce: function (astObject, name) {
        try {
            return ast.reduce(astObject);
        } catch (e) {
            e.sourceName = name;
            e.step = "ast.reduce";
            throw e;
        }
    },

    // _toAst and append to _placeholder
    _addAst: function (name) {
        var astObject = this._toAst(name),
            astBody = clone(astObject.body),
            placeholder = this._placeholder;
        if (astBody instanceof Array) {
            astBody.forEach(function (astItem) {
                placeholder.push(astItem);
            });
        } else {
            placeholder.push(astBody);
        }
    },

    build: function () {
        this._debug("Building library");
        var ARGUMENTS = "arguments",
            resultAst,
            name;
        // Generate UMD AST
        resultAst = clone(this._toAst("UMD"));
        // Grab the final placeholder
        this._placeholder = resultAst.body[0].expression[ARGUMENTS][1].body.body;
        this._placeholder.pop(); // remove __gpf__
        // Generate all ASTs and aggregate to the final result
        this._addAst("boot");
        for (name in this._sources) {
            if (this._sources.hasOwnProperty(name) && undefined === this._asts[name]) {
                this._addAst(name);
            }
        }
        // Saving the result
        this._debug("\tSaving concatenated AST...")
        this._save("result.ast.json", JSON.stringify(resultAst));
        // Generate the final result
        return ast.rewrite(resultAst, this._parameters.rewriteOptions);
    }

};

/**
 * Build the requested version
 *
 * @param {Object} sources Dictionary of sources
 * @param {Object} parameters Version parameters
 * @param {Object} temporary Dictionary of intermediate results
 * @returns {String}
 */
module.exports = function (sources, parameters, debug) {
    var builder = new Builder(sources, parameters, debug);
    return builder.build();
};
