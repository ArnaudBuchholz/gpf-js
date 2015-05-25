module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        //region JavaScript linter
        jshint: {
            files: ["Gruntfile.js", "src/**/*.js", "test/**/*.js"],
            options: {
                jshintrc: true
            }
        },
        //endregion
        //region Mocha test automation inside PhantomJS
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
        //endregion
        //region Mocha test automation inside NodeJS
        mochaTest: {
            source: {
                options: {
                },
                src: ["test/host/mocha/nodejs.js"]
            }
        },
        //endregion
        //region Watcher
        watch: {
            files: ["<%= jshint.files %>"],
            tasks: ["jshint"]
        }
        //endregion
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-mocha");
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("default", ["jshint"]);
};