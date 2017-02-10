"use strict";

module.exports = function (grunt) {

    grunt.registerTask("pre-serve", function () {
        var changedFiles = {};

        var onChange = grunt.util._.debounce(function () {
            grunt.config.set("jshint.files", Object.keys(changedFiles));
            grunt.config.set("eslint.target", Object.keys(changedFiles));
            changedFiles = {};
        }, 200);

        grunt.event.on("watch", function (action, filepath) {
            if (filepath.indexOf("sources.json") === -1) {
                changedFiles[filepath] = action;
                onChange();
            } else {
                configuration.readSources();
                grunt.config.set("jshint.files", configuration.files.linting.js.concat("make/*.json"));
                grunt.config.set("eslint.target", configuration.files.linting.js);
            }
        });
    });

    grunt.registerTask("serve", [
        "pre-serve",
        "connect:server",
        "watch"
    ]);
};
