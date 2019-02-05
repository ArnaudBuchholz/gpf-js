"use strict";

/*jshint esversion: 6*/

const
    path = require("path"),
    tools = require("../res/tools");

module.exports = {
    meta: {
        docs: {
            url: "https://github.com/ArnaudBuchholz/gpf-js/blob/master/.eslintrules/no-empty-module.js",
            description: "Assess that modules have at least one function",
            category: "Custom rules",
            recommended: false
        },
        fixable: "code",
        schema: [],
        messages: {
            noEmptyModule: "Module has no function"
        }
    },
    create (context) {
        let hasFunction = false;
        return {
            "Program:exit" (node) {
                if (!hasFunction) {
                    context.report({
                        node,
                        messageId: "noEmptyModule",
                        fix: fixer => {
                            const
                                fileNameParts = context.getFilename().split(path.sep),
                                fileName = fileNameParts
                                    .splice(fileNameParts.indexOf("src") + 1)
                                    .map(tools.capitalize)
                                    .join("")
                                    .replace(".js", "");
                            return fixer.insertTextAfter(node, `

/*#ifndef(UMD)*/

// Generates an empty function to reflect the null complexity of this module
(function _gpf${fileName} () {})();

/*#endif*/
`);
                        }
                    });
                }
            },
            FunctionDeclaration (node) {
                hasFunction = true;
            },
            FunctionExpression (node) {
                hasFunction = true;
            },
            ArrowFunctionExpression (node) {
                hasFunction = true;
            }
        };
    }
};
