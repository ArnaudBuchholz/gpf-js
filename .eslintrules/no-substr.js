"use strict";

/*jshint esversion: 6*/

module.exports = {
    meta: {
        docs: {
            description: "Forbid the use of String.prototype.substr API",
            category: "Custom rules",
            recommended: false
        },
        schema: [],
    },
    create (context) {
        return {
            MemberExpression (node) {
                if (['Identifier', 'Literal'].includes(node.object.type) && node.property.name === 'substr') {
                    context.report(node, '.substr should not be used anymore');
                }
            }
        };
    }
};