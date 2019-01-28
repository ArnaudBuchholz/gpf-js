"use strict";

const
    tools = require("../../res/tools.js");

module.exports = function (grunt) {

    grunt.registerTask("make", [
        "exec:version",
        "check",
        "connectIf",
        "concurrent:source"
    ].concat(configuration.files.legacyTest
        .map(version => `concurrent:legacy${version}`)
    ).concat([
        "exec:buildDebug",
        "exec:buildRelease",
        "uglify:release",
        "exec:fixUglify:gpf",
        "concurrent:debug",
        "concurrent:release",
        "exec:buildTestIncludes",
        "uglify:tests",
        "exec:fixUglify:tests"
    ]).concat(Object.keys(configuration.files.flavors).reduce((tasks, flavor) => tasks.concat([
        `exec:build${tools.capitalize(flavor)}`,
        `uglify:flavor:${flavor}`,
        `concurrent:flavor@${flavor}`
    ]), [])));

};
