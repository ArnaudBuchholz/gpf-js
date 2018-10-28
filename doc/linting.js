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
    ],

    config = JSON.parse(fs.readFileSync(path.join(__dirname, "../.eslintrc")).toString()),
    categories = JSON.parse(fs.readFileSync(path.join(__dirname, "../node_modules/eslint/conf/category-list.json")).toString()),
    ruleFilenames = fs.readdirSync(path.join(__dirname, "../node_modules/eslint/lib/rules")),
    orderOfCategories = [
        "Possible Errors",
        "Best Practices",
        "Strict Mode",
        "Variables",
        "Node.js and CommonJS",
        "Stylistic Issues",
        "ECMAScript 6"
    ]
;

ruleFilenames
    .map(ruleFilename => {
        const
            name = path.basename(ruleFilename, ".js"),
            rule = require(path.join(__dirname, "../node_modules/eslint/lib/rules", ruleFilename)),
            docs = rule.meta.docs,
            category = docs.category,
            description = docs.description,
            recommended = docs.recommended,
            isSet = config.rules[name];
        return {
            name,
            category,
            description,
            recommended,
            isSet
        };
    })
    .sort((rule1, rule2) => {
        const
            rule1CategoryOrder = orderOfCategories.indexOf(rule1.category),
            rule2CategoryOrder = orderOfCategories.indexOf(rule2.category);
        if (rule1CategoryOrder !== rule2CategoryOrder) {
            return rule1CategoryOrder - rule2CategoryOrder;
        }
        return rule1.name.localeCompare(rule2.name);
    })
    .forEach(rule => {
        console.log(rule.name.padEnd(40, " "), rule.category.padEnd(20, " "),
            rule.recommended ? "R" : " ",
            rule.isSet ? "S": " "
        );
    })
