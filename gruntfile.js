"use strict";
/*jshint node: true*/
/*eslint-env node*/

module.exports = function (grunt) {

    require("time-grunt")(grunt);

    // Since the tasks are split using load-grunt-config, a global object contains the configuration
    /*global configuration*/
    try {
        global.configuration = grunt.file.readJSON("tmp/config.json");
    } catch (e) {
        grunt.registerTask("default", function () {
            var done = this.async(); //eslint-disable-line no-invalid-this
            grunt.util.spawn({
                cmd: "node",
                args: ["make/config"],
                opts: {
                    stdio: "inherit"
                }
            }, function (error) {
                if (error) {
                    done();
                    return;
                }
                grunt.util.spawn({
                    grunt: true,
                    args: ["check", "jsdoc", "default"],
                    opts: {
                        stdio: "inherit"
                    }
                }, done);
            });
        });
        return;
    }

    configuration.readSources = function () {
        // Build the list of valid source and test files based on sources.json
        var sources = grunt.file.readJSON("src/sources.json"),
            srcFiles = ["src/boot.js"],
            docFiles = ["src/boot.js"],
            testFiles = [];
        sources.forEach(function (source) {
            var name = source.name;
            if (source.load !== false) {
                srcFiles.push("src/" + name + ".js");
                if (source.test !== false) {
                    testFiles.push("test/" + name + ".js");
                }
                if (source.doc === true) {
                    docFiles.push("src/" + name + ".js");
                }
            }
        });
        this.files = {
            src: srcFiles,
            test: testFiles,
            doc: docFiles,
            linting: {
                js: [
                    "gruntfile.js",
                    "grunt/**/*.js",
                    "statistics.js",
                    "make/*.js",
                    "test/host/**/*.js",
                    "res/*.js"
                ]
                    .concat(srcFiles)
                    .concat(testFiles)
            }
        };
    };

    configuration.readSources();

    // Amend the configuration with internal settings
    configuration.pkg = grunt.file.readJSON("./package.json");

    require("load-grunt-config")(grunt);
    grunt.task.loadTasks("grunt/tasks");

};
