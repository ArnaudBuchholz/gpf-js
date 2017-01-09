"use strict";
/*jshint node: true*/
/*eslint-env node*/

module.exports = function (grunt) {

    require("time-grunt")(grunt);

    var config;
    try {
        config = grunt.file.readJSON("tmp/config.json");
    } catch (e) {
        grunt.log.writeln("No configuration file found");
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
                    args: ["check", "jsdoc", "default"]
                }, done);
            });
        });
        return;
    }

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

    // Since the tasks are split using load-grunt-config, I need a global object containing the configuration
    global.configuration = {
        pkg: grunt.file.readJSON("./package.json"),
        cfg: config,
        metrics: config.metrics,
        httpPort: config.grunt.httpPort,
        selenium: config.selenium.browsers,
        srcFiles: srcFiles,
        testFiles: testFiles,
        docFiles: docFiles,
        jsLintedFiles: [
            "Gruntfile.js",
            "grunt/**/*.js",
            "statistics.js",
            "make/*.js",
            "test/host/**/*.js",
            "res/*.js"
        ]
            .concat(srcFiles)
            .concat(testFiles)
    };

    require("load-grunt-config")(grunt);
    grunt.task.loadTasks("grunt/tasks");

};
