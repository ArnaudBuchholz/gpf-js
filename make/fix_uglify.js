"use strict";

var EXCEPTION_VARIABLE = "e_",
    fs = require("fs");

function getVariableNameMatcher (name) {
    return new RegExp("\\b" + name + "\\b", "g");
}

function fix (name) {
    var fileName =  "build/" + name + ".js",
        before = fs.readFileSync(fileName).toString(),
        after;

    if (getVariableNameMatcher(EXCEPTION_VARIABLE).exec(before)) {
        console.error("Exception variable '" + EXCEPTION_VARIABLE + "' already used in " + fileName);
        return false;
    }

    after = before.replace(new RegExp("catch\\((\\w+)\\)\\s*{([^}]*)}", "g"), function (match, varName, block) {
        return [
            "catch(",
            EXCEPTION_VARIABLE,
            "){",
            block.replace(getVariableNameMatcher(varName), EXCEPTION_VARIABLE),
            "}"
        ].join("");
    });

    fs.writeFileSync(fileName, after);
    console.log("Fixed uglify'ed version of " + fileName);
    return true;
}

if (!fix(process.argv[2])) {
    process.exit(-1);
}
