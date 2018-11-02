"use strict";

const
    fs = require("fs"),
    path = require("path"),

    ESLINT = path.join(__dirname, "../node_modules/eslint/"),
    ESLINT_RULES = path.join(ESLINT, "lib/rules"),
    ESLINT_CATEGORIES = path.join(ESLINT, "conf/category-list.json"),
    ESLINTRC = path.join(__dirname, "../.eslintrc"),
    DOCUMENTATION = path.join(__dirname, "linting"),

    RULE_IGNORED = "ignore",
    RULE_NOT_SET = "-",

    LEVELS = [
        RULE_IGNORED,
        "warning",
        "error",
        RULE_NOT_SET
    ],

    ruleFilenames = fs.readdirSync(ESLINT_RULES),
    orderOfCategories = JSON.parse(fs.readFileSync(ESLINT_CATEGORIES).toString()).categories
        .map(category => category.name),
    eslintrc = JSON.parse(fs.readFileSync(ESLINTRC).toString()),

    readLevel = ruleConfiguration => {
        if (Array.isArray(ruleConfiguration)) {
            return ruleConfiguration[0];
        }
        if (undefined !== ruleConfiguration) {
            return ruleConfiguration;
        }
        return LEVELS.length - 1;
    },

    hasDocumentation = ruleName => {
        const documentationPath = path.join(DOCUMENTATION, `${ruleName}.md`);
        try {
            fs.accessSync(documentationPath, fs.constants.R_OK);
            return fs.readFileSync(documentationPath).toString();
        } catch (e) {
            return "";
        }
    },

    configuration = ruleName => {
        const
            ruleConfiguration = eslintrc.rules[ruleName],
            documentation = hasDocumentation(ruleName);
        if (undefined !== ruleConfiguration) {
            return {
                level: LEVELS[readLevel(ruleConfiguration)],
                parameterized: Array.isArray(ruleConfiguration),
                documentation: documentation
            };
        }
        return {
            level: RULE_NOT_SET,
            documentation: documentation
        };
    },

    error = (rule, message) => {
        console.error(
            "\t",
            rule.name.padEnd(40, " "),
            "***",
            message
        );
    },

    checkForInvalidProperties = rule => {
        if (rule.meta.schema && Object.keys(rule.meta.schema).length) {
            return; // Whether an array or an object, it has properties
        }
        if (rule.parameterized) {
            error(rule, "has unexpected parameters");
        }
    },

    checkForDeprecatedRule = rule => {
        if (rule.meta.deprecated && rule.level !== RULE_NOT_SET) {
            error(rule, `is deprecated, should use: ${rule.meta.docs.replacedBy.join(",")}`);
        }
    },

    checkForUselessIgnore = rule => {
        if (!rule.meta.docs.recommended && rule.level === RULE_IGNORED) {
            error(rule, "does not need to be ignored");
        }
    },

    checkForInvalidUse = rule => {
        checkForInvalidProperties(rule);
        checkForDeprecatedRule(rule);
        checkForUselessIgnore(rule);
    },

    linting = [
        fs.readFileSync(path.join(DOCUMENTATION, ".header.md")).toString()
    ]
;

// Assess that all rules specified in the .eslintrc actually exists !
Object.keys(eslintrc.rules)
    .filter(name => !ruleFilenames.includes(`${name}.js`))
    .forEach(name => {
        console.error(`Unknown rule name: ${name}`);
    });

// List rules
ruleFilenames
    .map(ruleFilename => {
        const name = path.basename(ruleFilename, ".js");
        return Object.assign({
            name: name,
            meta: require(path.join(__dirname, "../node_modules/eslint/lib/rules", ruleFilename)).meta
        }, configuration(name));
    })
    .sort((rule1, rule2) => {
        const
            rule1CategoryOrder = orderOfCategories.indexOf(rule1.meta.docs.category),
            rule2CategoryOrder = orderOfCategories.indexOf(rule2.meta.docs.category);
        if (rule1CategoryOrder !== rule2CategoryOrder) {
            return rule1CategoryOrder - rule2CategoryOrder;
        }
        return rule1.name.localeCompare(rule2.name);
    })
    .forEach((rule, index, rules) => {
        const
            flag = (value, mark) => value ? mark : " ",
            category = rule.meta.docs.category,
            recommended = rule.meta.docs.recommended;
        if (index === 0 || rules[index - 1].meta.docs.category !== category) {
            console.log(category);
            linting.push(`<h3>${category}</h3>|||\n`);
        }
        checkForInvalidUse(rule);
        console.log(
            "\t",
            rule.name.padEnd(40, " "),
            flag(rule.meta.fixable, "F"),
            flag(recommended, "R"),
            rule.level.padEnd(7),
            flag(rule.parameterized, "C"),
            flag(rule.documentation, "*")
        );
        linting.push(
            `[${rule.name}](https://eslint.org/docs/rules/${rule.name})|`,
            recommended ? "*error*" : rule.level, "|",
            "|",
            rule.documentation.replace(/\n/g, "<br>"),
            "\n"
        );
    });

linting.push(fs.readFileSync(path.join(DOCUMENTATION, ".footer.md")).toString());
fs.writeFileSync(path.join(__dirname, "tutorials/LINTING.md"), linting.join(""));
