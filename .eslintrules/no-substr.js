"use strict";

/*jshint esversion: 6*/

module.exports = {
    meta: {
        docs: {
            url: "https://github.com/ArnaudBuchholz/gpf-js/blob/master/.eslintrules/no-substr.js",
            description: "Forbid the use of String.prototype.substr API",
            category: "Custom rules",
            recommended: false
        },
        schema: [],
        messages: {
            noSubstr: ".substr should not be used anymore"
        }
    },
    create (context) {
        return {
            MemberExpression (node) {
                if (["Identifier", "Literal"].includes(node.object.type) && node.property.name === 'substr') {
                    context.report({
                        node,
                        messageId: "noSubstr"
                    });
                }
            }
        };
    }
};
