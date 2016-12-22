"use strict";
/*jshint -W079*/ // Redefinition of Promise with bluebird

const
    EXCEPTION_VARIABLE = "e_",
    Promise = require("bluebird"),
    fs = Promise.promisifyAll(require("fs")),
    fileName = `build/${process.argv[2]}.js`,
    getVariableNameMatcher = name => new RegExp("\\b" + name + "\\b", "g");

fs.readFileAsync(fileName)
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
    // Serializing
    .then(source => fs.writeFileAsync(fileName, source))
    .then(() => console.log("Fixed uglify'ed version of " + fileName))
    .catch(error => {
        console.error("Error while fixing uglify'ed version of " + fileName + ": " + error.message);
        process.exit(-1);
    });
