/**
 * @fileoverview Rule to flag use of switch statement
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
        "SwitchStatement": function(node) {
            context.report(node, "Unexpected use of 'switch' statement.");
        }
    };

};

module.exports.schema = [];
