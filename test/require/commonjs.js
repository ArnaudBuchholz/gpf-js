/*
 * The scope is 'private'.
 * Imports can be realized with require()
 * Exports are made through the assignment to module.exports.
 */
"use strict";

var data = require("data.json");

module.exports = {
    type: "commonjs",
    data: data
};
