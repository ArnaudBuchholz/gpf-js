/*
 * The scope is 'private'.
 * Imports can be realized with require()
 * Exports are made through the assignment to module.exports.
 */
"use strict";

var data = require("data.json"),
    fileName = "data2.json",
    data2 = require(fileName);

module.exports = {
    type: "mixed_commonjs",
    data: data,
    data2: data2
};
