"use strict";

module.exports = function (grunt) {
    grunt.registerTask("make", [
        "exec:version",
        "check",
        "connectIf",
        "concurrent:source"
    ].concat(configuration.files.legacyTest
        .map(version => `concurrent:legacy${version.substr(0, version.lastIndexOf("."))}`)
    ).concat([
        "exec:buildDebug",
        "exec:buildRelease",
        "uglify:buildRelease",
        "exec:fixUglify:gpf",
        "concurrent:debug",
        "concurrent:release",
        "uglify:buildTests",
        "exec:fixUglify:tests"
    ]));
};
