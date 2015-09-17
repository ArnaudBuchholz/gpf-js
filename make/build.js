"use strict";

var fs = require("fs"),
    preprocess = require("./preprocess.js"),
    ast = require("./ast.js");

function clone (obj) {
    return JSON.parse(JSON.stringify(obj));
}

function Builder(sources, parameters) {
    this._sources = sources;
    this._parameters = parameters;
}

Builder.prototype = {

    // Sources dictionary (name => String)
    _sources: {},

    // Parameters of the build
    _parameters: {},

    // AST objects (name => Object)
    _asts: {},

    // AST result placeholder
    _placeholder: {},

    // save temporary files
    _save: function (fileName, data) {
        if (this._parameters.saveTemporaryfiles) {
            fs.writeFileSync(this._parameters.temporaryPath+ "/" + fileName, data);
        }
    },

    // preprocess source file, convert to AST and reduce it if necessary
    _toAst: function (name) {
        var source,
            astObject;
        try {
            preprocess(this._sources[name], this._parameters.define);
        } catch (e) {
            e.sourceName = name;
            e.step = "preprocess";
            throw e;
        }
        this._save(name + ".js", source);
        try {
            astObject = ast.transform(source);
        } catch (e) {
            e.sourceName = name;
            e.step = "ast.transform";
            throw e;
        }
        this._save(name + ".ast.json", JSON.stringify(astObject));
        if (this.parameters.reduce) {
            try {
                astObject = ast.reduce(astObject);
            } catch (e) {
                e.sourceName = name;
                e.step = "ast.reduce";
                throw e;
            }
            this._save(name + ".ast.reduced.json", JSON.stringify(astObject));
            this._save(name + ".ast.reduced.js", ast.rewrite(astObject, this._parameters.debugRewriteOptions));
        }
        this._asts[name] = astObject;
        return astObject;
    },

    // _toAst and append to _placeholder
    _addAst: function (name) {
        var astObject = this._toAst(name),
            astBody = clone(astObject.body),
            placeholder = this._placeholder;
        if (astBody instanceof Array) {
            astBody.forEach(placeholder.push, placeholder);
        } else {
            placeholder.push(astBody);
        }
    },

    build: function () {
        var resultAst,
            name;
        // Generate UMD AST
        resultAst = clone(this._toAst("UMD"));
        // Grab the final placeholder
        this._placeholder = resultAst.body[0].expression["arguments"][1].body.body;
        this._placeholder.pop(); // remove __gpf__
        // Generate all ASTs and aggregate to the final result
        this._addAst("boot");
        for (name in this._sources) {
            if (this._sources.hasOwnProperty(name)) {
                this._addAst(name);
            }
        }
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
module.exports = function (sources, parameters) {
    var builder = new Builder(sources, parameters);
    return builder.build();
};
