"use strict";

const BOUNCE_DELAY = 200;

module.exports = function (grunt) {

    grunt.registerTask("pre-serve", function () {
        let changedFiles = {};

        const onChange = grunt.util._.debounce(function () {
            grunt.config.set("jshint.files", Object.keys(changedFiles));
            grunt.config.set("eslint.target", Object.keys(changedFiles));
            changedFiles = {};
        }, BOUNCE_DELAY);

        grunt.event.on("watch", function (action, filepath) {
            if (action !== "deleted" && !filepath.includes("sources.json")) {
                changedFiles[filepath] = action;
                onChange();
            } else {
                configFile.readSourceFiles();
                grunt.config.set("jshint.files", configuration.files.linting.js.concat("make/*.json"));
                grunt.config.set("eslint.target", configuration.files.linting.js);
                grunt.config.set("mochaTest.source.src", configuration.files.test);
            }
        });
    });

    grunt.registerTask("serve", [
        "pre-serve",
        "connect:serve",
        "open_tiles",
        "watch"
    ]);

    grunt.registerTask("serve-only", [
        "connect:serve-and-wait"
    ]);
};
