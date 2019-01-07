"use strict";

const
    fs = require("fs"),
    path = require("path"),

    PAD_RULENAME = 40,
    PAD_LEVEL = 7,

    ESLINT = path.join(__dirname, "../node_modules/eslint/"),
    ESLINT_RULES = path.join(ESLINT, "lib/rules"),
    ESLINT_CATEGORIES = path.join(ESLINT, "conf/category-list.json"),
    ESLINTRC = path.join(__dirname, "../.eslintrc"),
    CUSTOM_RULES = path.join(__dirname, "../.eslintrules"),
    DOCUMENTATION = path.join(__dirname, "linting"),

    RULE_IGNORED = "ignore",
    RULE_NOT_SET = "-",

    LEVELS = [
        RULE_IGNORED,
        "warning",
        "error",
        RULE_NOT_SET
    ],

    eslintRuleFilenames = fs.readdirSync(ESLINT_RULES),
    customRuleFilenames = fs.readdirSync(CUSTOM_RULES)
        .filter(name => path.extname(name) === ".js" && !eslintRuleFilenames.includes(name)),
    ruleFilenames = eslintRuleFilenames.concat(customRuleFilenames),
    orderOfCategories = JSON.parse(fs.readFileSync(ESLINT_CATEGORIES).toString()).categories
        .map(category => category.name),
    eslintrcText = fs.readFileSync(ESLINTRC).toString(),
    eslintrc = JSON.parse(eslintrcText),

    readLevel = ruleConfiguration => {
        if (Array.isArray(ruleConfiguration)) {
            const [level] = ruleConfiguration;
            return LEVELS[level];
        }
        if (undefined !== ruleConfiguration) {
            return LEVELS[ruleConfiguration];
        }
        return RULE_NOT_SET;
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
            documentation = hasDocumentation(ruleName),
            parameterized = Array.isArray(ruleConfiguration);
        if (undefined !== ruleConfiguration) {
            let parameters;
            if (parameterized) {
                [, ...parameters] = ruleConfiguration;
            }
            const line = eslintrcText.split(`"${ruleName}"`).shift().split("\n").length;
            return {
                level: readLevel(ruleConfiguration),
                parameterized: parameterized,
                parameters: parameters,
                line: line,
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
            rule.name.padEnd(PAD_RULENAME, " "),
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
            const replacedBy = rule.meta.docs.replacedBy || rule.meta.replacedBy;
            if (replacedBy.length) {
                error(rule, `is deprecated, should use: ${replacedBy.join(",")}`);
            } else {
                console.log("\t", rule.name.padEnd(PAD_RULENAME, " "), "is deprecated but not replaced");
            }
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
    ],

    renderParameters = rule => {
        if (!rule.parameterized) {
            return "";
        }
        const ONE_PARAM_ONLY = 1;
        if (rule.parameters.length === ONE_PARAM_ONLY) {
            const
                MAX_STRING_LENGTH = 15,
                [firstParameter] = rule.parameters,
                stringified = JSON.stringify(firstParameter);
            if (stringified.length < MAX_STRING_LENGTH) {
                return stringified;
            }
        }
        return `[*.eslintrc*](https://github.com/ArnaudBuchholz/gpf-js/blob/master/.eslintrc#L${rule.line})`;
    },

    getRule = ruleFilename => {
        const eslintPath = path.join(ESLINT_RULES, ruleFilename);
        try {
            fs.accessSync(eslintPath, fs.constants.R_OK);
            return require(eslintPath);
        } catch (e) {
            return require(path.join(CUSTOM_RULES, ruleFilename));
        }
    }
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
            meta: getRule(ruleFilename).meta
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
        if (rules._lastCategory !== category) {
            console.log(category);
            linting.push(`**${category}** | | | |\n`);
            rules._lastCategory = category;
        }
        checkForInvalidUse(rule);
        console.log(
            "\t",
            rule.name.padEnd(PAD_RULENAME, " "),
            flag(rule.meta.fixable, "F"),
            flag(recommended, "R"),
            rule.level.padEnd(PAD_LEVEL),
            flag(rule.parameterized, "C"),
            flag(rule.documentation, "*")
        );
        linting.push(
            `[${rule.name}](${rule.meta.docs.url}) | `,
            flag(rule.meta.fixable, "&check;"), " | ",
            recommended && rule.level === RULE_NOT_SET ? "*error*" : `**${rule.level}**`, " | ",
            renderParameters(rule), " | ",
            rule.documentation.replace(/\n/g, " "),
            "\n"
        );
    });

linting.push(fs.readFileSync(path.join(DOCUMENTATION, ".footer.md")).toString());
fs.writeFileSync(path.join(__dirname, "tutorials/LINTING.md"), linting.join(""));
