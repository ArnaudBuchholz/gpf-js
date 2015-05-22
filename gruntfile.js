module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        jshint: {
            files: ["Gruntfile.js", "src/**/*.js", "test/**/*.js"],
            options: {
                jshintrc: true
            }
        },
        mocha: {
            source: {
                options: {
                    log: false,
                    run: false
                },
                src: ["test/host/mocha/web.html"]
            },
            debug: {
                options: {
                    log: false,
                    run: false
                },
                src: ["test/host/mocha/web_debug.html"]
            },
            release: {
                options: {
                    log: false,
                    run: false
                },
                src: ["test/host/mocha/web_release.html"]
            }
        },
        watch: {
            files: ["<%= jshint.files %>"],
            tasks: ["jshint"]
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-mocha");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("default", ["jshint"]);
};