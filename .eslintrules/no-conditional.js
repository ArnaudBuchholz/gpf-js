/**
 * @fileoverview Rule to flag use of conditional expression
 * @author Arnaud Buchholz
 */

"use strict";
/*jshint node:true*/
/*eslint-env node*/

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function(context) {

    return {
        "ConditionalExpression": function(node) {
            context.report(node, "Unexpected use of conditional expression.");
        }
    };

};

module.exports.schema = [];
