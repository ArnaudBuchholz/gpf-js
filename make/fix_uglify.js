"use strict";

var EXCEPTION_VARIABLE = "e_",
    fs = require("fs"),
    srcFromUglify = fs.readFileSync("build/gpf.js").toString(),
    result;

function getVariableNameMatcher (name) {
    return new RegExp("\\b" + name + "\\b", "g");
}

if (getVariableNameMatcher(EXCEPTION_VARIABLE).exec(srcFromUglify)) {
    console.error("Exception variable '" + EXCEPTION_VARIABLE + "' already used");
    process.exit(-1);
}

result = srcFromUglify.replace(new RegExp("catch\\((\\w+)\\)\\s*{([^}]*)}", "g"), function (match, varName, block) {
    return [
        "catch(",
        EXCEPTION_VARIABLE,
        "){",
        block.replace(getVariableNameMatcher(varName), EXCEPTION_VARIABLE),
        "}"
    ].join("");
});

fs.writeFileSync("build/gpf.js", result);
console.log("Fixed uglify'ed version");
