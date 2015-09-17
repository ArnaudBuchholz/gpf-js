"use strict";

var preprocess = require("./preprocess.js"),
    ast = require("./ast.js");

function pushCloneOf(idx, item) {
    /*jshint validthis:true*/ //
    this.push(gpf.clone(item));
}

/**
 * Process a specific source
 *
 * @param {Object} parsed Dictionary of sources
 * @param {String} source Source name
 * @param {Object} version Version to apply
 * @param {Object} placeholder result AST placeholder
 * @param {ASTreducer} reducer
 */
function process (parsed, source, version, placeholder, reducer) {
    var body;
    try {
        body = parsed[source].body;
    } catch(e) {
        console.error("Error while processing source: " + source
        + "\r\n" + e.message);
    }
    if (version.reduce) {
        reducer.reduce(body);
        try {
            parsed[source + ".compact.js"] = ast.rewrite(parsed[source], versions.debug.rewriteOptions);
        } catch (e) {
            console.error("Failed to generate compact source for " + source + ": " + e.message);
        }
    }
    if (body instanceof Array) {
        gpf.each.apply(placeholder, [body, pushCloneOf]);
    } else {
        placeholder.push(gpf.clone(body));
    }
}

/**
 * Build the requested version
 *
 * @param {Object} sources Dictionary of sources
 * @param {Object} parameters Version parameters
 * @param {Object} temporary Dictionary of intermediate results
 * @returns {String}
 */
module.exports = function (sources, parameters, temporary) {
    var parsed,
        placeholder,
        idx,
        source,
        reducer = null;
    // First, parse everything
    temporary["UMD.js"] = preprocess(sources.UMD, parameters);
    temporary.UMD = ast.transform(temporary["UMD.js"], parameters);
    if (parameters.reduce) {
        ast.reduce(temporary.UMD.body);
        try {
            temporary["UMD.compact.js"] = ast.rewrite(temporary.UMD, parameters.rewriteOptions);
        } catch (e) {
            console.error("Failed to generate compact source for UMD: " + e.message);
        }
    }
    parsed.result = gpf.clone(temporary.UMD);
    parsed["boot.js"] = preProcess(sources.boot, version);
    parsed.boot = toAST(parsed, "boot.js", version);
    for (idx = 0; idx < sources._list.length; ++idx) {
        source = sources._list[idx];
        parsed[source + ".js"] = preProcess(sources[source], version);
        parsed[source] = toAST(parsed, source + ".js", version);
    }
    placeholder = parsed.result.body[0].expression["arguments"][1].body.body;
    placeholder.pop(); // remove __gpf__
    // Add all sources
    for (idx = -1; idx < sources._list.length; ++idx) {
        if (-1 === idx) {
            source = "boot";
        } else {
            source = sources._list[idx];
        }
        process(parsed, source, version, placeholder, reducer);
    }
    // And generate the result
    parsed["result.js"] = escodegen.generate(parsed.result, version.rewriteOptions);
    return parsed["result.js"];
};
