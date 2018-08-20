"use strict";

/*global process*/

const
    fs = require("fs"),
    path = require("path"),

    error = err => {
        console.error(err);
        process.exit();
    },

    levels = [
        "ignore",
        "warning",
        "error"
    ]
    ;

new Promise(resolve => {
    fs.readFile(path.join(__dirname, "../.eslintrc"), (err, data) => {
        if (err) {
            error(err);
        }
        resolve(JSON.parse(data.toString()).rules);
    });
})
    .then(rules => {
        Promise.resolve(Object.keys(rules))
            .then(ruleNames => ruleNames.filter(ruleName => !ruleName.startsWith("http://")))
            .then(ruleNames => ruleNames.filter(ruleName => !ruleName.startsWith("#")))
            .then(ruleNames => ruleNames.filter(ruleName => -1 === ruleName.indexOf(":")))
            .then(ruleNames => {
                ruleNames.forEach(ruleName => {
                    const
                        modifier = rules[ruleName],
                        level = modifier[0] || modifier;
                    console.log(`${ruleName.padStart(30, " ")} ${levels[level]}`);
                });
            });
    });
