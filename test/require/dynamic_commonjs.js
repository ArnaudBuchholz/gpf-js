/*
 * The scope is 'private'.
 * Imports can be realized with require()
 * Exports are made through the assignment to module.exports.
 */
"use strict";

var fileName = "data.json",
    data = require(fileName);

module.exports = {
    type: "dynamic_commonjs",
    data: data
};
