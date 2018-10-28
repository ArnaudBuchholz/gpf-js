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
            hasProperties = rule.meta.schema.length ? rule.meta.schema[0].properties : false,
            isSet = config.rules[name],
            hasPropertiesSet = Array.isArray(isSet);
        return {
            name,
            category,
            description,
            recommended,
            hasProperties,
            isSet,
            hasPropertiesSet
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
    .forEach((rule, index, rules) => {
        if (0 === index || rules[index - 1].category !== rule.category) {
            console.log(rule.category);
        }
        console.log(
            "\t",
            rule.name.padEnd(40, " "),
            rule.recommended ? "R" : " ",
            rule.hasProperties ? "P": " ",
            rule.isSet ? "S": " ",
            rule.hasPropertiesSet ? "C": " ",
        );
    })
