"use strict";

const
    fs = require("fs"),
    preprocess = require("./preprocess.js"),
    ast = require("./ast.js"),

    nop = () => {},
    clone = obj => JSON.parse(JSON.stringify(obj));

class Builder {

    constructor (sources, parameters, debug) {
        // Sources dictionary (name => String)
        this._sources = sources;

        // Parameters of the build
        this._parameters = parameters;

        // Debug function
        this._debug = debug || nop;

        // AST objects (name => Object)
        this._asts = {};

        // AST result placeholder
        this._placeholder = {};
    }

    // save temporary files
    _save (fileName, data) {
        if (this._parameters.saveTemporaryfiles) {
            fs.writeFileSync(this._parameters.temporaryPath + "/" + fileName, data);
        }
    }

    // preprocess source file, convert to AST and reduce it if necessary
    _toAst (name) {
        this._debug(`\tConverting ${name} to AST...`);
        let source = this._sources[name],
            astObject;
        source = this._preProcess(source, name);
        this._save(`${name}.js`, source);
        astObject = this._transform(source, name);
        this._save(`${name}.ast.json`, JSON.stringify(astObject));
        this._asts[name] = astObject;
        return astObject;
    }

    _preProcess (source, name) {
        try {
            return preprocess(source, this._parameters.define);
        } catch (e) {
            e.sourceName = name;
            e.step = "preprocess";
            throw e;
        }
    }

    _transform (source, name) {
        try {
            return ast.transform(source);
        } catch (e) {
            e.sourceName = name;
            e.step = "ast.transform";
            throw e;
        }
    }

    _optimize (resultAst, setting) {
        try {
            this._debug("\tOptimizing AST...");
            let optimizedAst = ast.optimize(resultAst, setting, this._debug);
            this._save("result.ast.optimized.json", JSON.stringify(optimizedAst));
            this._save("result.ast.optimized.js", ast.rewrite(optimizedAst, this._parameters.debugRewriteOptions));
            return optimizedAst;
        } catch (e) {
            e.step = "ast.optimize";
            throw e;
        }
    }

    // _toAst and append to _placeholder
    _addAst (name) {
        let astObject = this._toAst(name),
            astBody = clone(astObject.body),
            placeholder = this._placeholder;
        if (astBody instanceof Array) {
            astBody.forEach(function (astItem) {
                placeholder.push(astItem);
            });
        } else {
            placeholder.push(astBody);
        }
    }

    build () {
        this._debug("Building library");
        const
            ARGUMENTS = "arguments",
            FIRST = 0;
        let resultAst,
            name;
        // Generate UMD AST
        resultAst = clone(this._toAst("UMD"));
        // Grab the final placeholder
        this._placeholder = resultAst.body[FIRST].expression[ARGUMENTS][FIRST].body.body;
        this._placeholder.pop(); // remove __gpf__
        // Generate all ASTs and aggregate to the final result
        this._addAst("boot");
        for (name in this._sources) {
            if (this._sources.hasOwnProperty(name) && undefined === this._asts[name]) {
                this._addAst(name);
            }
        }
        // Optimize ?
        if (this._parameters.optimize) {
            resultAst = this._optimize(resultAst, this._parameters.optimize);
        }
        // Saving the result
        this._debug("\tSaving concatenated AST...");
        this._save("result.ast.json", JSON.stringify(resultAst));
        // Generate the final result
        return ast.rewrite(resultAst, this._parameters.rewriteOptions);
    }

}

// Build the requested version
module.exports = (sources, parameters, debug) => {
    var builder = new Builder(sources, parameters, debug);
    return builder.build();
};
