"use strict";

/*global process*/

const
    ESLINT = "../node_modules/eslint/",
    RULES = ESLINT + "lib/rules",
    CONFIGURATION = "../.eslintrc",

    fs = require("fs"),
    path = require("path"),

    levels = [
        "ignore",
        "warning",
        "error",
        "-"
    ],

    gpfConfiguration = JSON.parse(fs.readFileSync(path.join(__dirname, CONFIGURATION)).toString()),
    ruleFilenames = fs.readdirSync(path.join(__dirname, RULES)),
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

// Assess that all rules specified in the .eslintrc actually exists !
Object.keys(gpfConfiguration.rules)
    .filter(name => !ruleFilenames.includes(`${name}.js`))
    .forEach(name => {
        console.error(`Unknown rule name: ${name}`)
    });

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
            config = gpfConfiguration.rules[name];
        let
            level = levels.length - 1,
            hasPropertiesSet = false;
        if (Array.isArray(config)) {
            level = config[0];
        } else if (undefined !== config) {
            level = config;
        }
        return {
            name,
            category,
            description,
            recommended,
            hasProperties,
            config,
            level,
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
        const flag = (value, mark) => value ? mark : " ";
        if (0 === index || rules[index - 1].category !== rule.category) {
            console.log(rule.category);
        }
        if (rule.hasPropertiesSet && !rule.hasProperties) {
            console.error(`Unexpected parameters for ${rule.name}`);
        }
        console.log(
            "\t",
            rule.name.padEnd(40, " "),
            flag(rule.recommended, "R"),
            levels[rule.level].padEnd(7),
            flag(rule.hasPropertiesSet, "C")
        );
    });
