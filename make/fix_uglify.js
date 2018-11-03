"use strict";
/*jshint -W079*/ // Redefinition of Promise with bluebird

const
    EXCEPTION_VARIABLE = "e_",
    FILENAME_ARG = 2,
    fs = require("fs"),
    fileName = `build/${process.argv[FILENAME_ARG]}.js`,
    getVariableNameMatcher = name => new RegExp("\\b" + name + "\\b", "g");

Promise.resolve(fs.readFileSync(fileName))
    .then(buffer => buffer.toString())
    // Processing try {} catch variable
    .then(source => getVariableNameMatcher(EXCEPTION_VARIABLE).exec(source)
        ? Promise.reject(new Error("Exception variable '" + EXCEPTION_VARIABLE + "' already used in " + fileName))
        : source
    )
    .then(source => source.replace(/catch\((\w+)\)\s*{([^}]*)}/g, (match, varName, block) => [
        "catch(",
        EXCEPTION_VARIABLE,
        "){",
        block.replace(getVariableNameMatcher(varName), EXCEPTION_VARIABLE),
        "}"
    ].join("")))
    // Processing <Promise>.catch syntax
    .then(source => source.replace(/\.catch/g, "[\"catch\"]"))
    // keep_quoted_props not working properly: .class => ["class"]
    .then(source => source.replace(/\.(class)(\W)/g, function (match, property, leadingChar) {
        return `["${property}"]${leadingChar}`;
    }))
    // replace new RegExp with literal
    .then(source => source.replace(/new RegExp\("([^"]+)"(?:,"([a-z]+)")?\)/g, function (match, regexp, options) {
        return `/${regexp.replace(/\\\\/g, "\\").replace(/\//g, "\\/")}/${options || ""}`;
    }))
    // Serializing
    .then(source => fs.writeFileSync(fileName, source))
    .then(() => console.log("Fixed uglify'ed version of " + fileName))
    .catch(error => {
        console.error("Error while fixing uglify'ed version of " + fileName + ": " + error.message);
        process.exit(-1);
    });
