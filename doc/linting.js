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

    ruleFilenames = fs.readdirSync(path.join(__dirname, "../node_modules/eslint/lib/rules"))
;

ruleFilenames.forEach(ruleFilename => {
    const
        name = path.basename(ruleFilename, ".js"),
        rule = require(path.join(__dirname, "../node_modules/eslint/lib/rules", ruleFilename)),
        docs = rule.meta.docs;
    console.log(name.padEnd(40, " "), docs.category.padEnd(20, " "), docs.recommended ? "R" : " ");
});
