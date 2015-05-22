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
            test: {
                options: {
                    log: false,
                    run: false
                },
                src: ["test/host/mocha/web.html"]
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