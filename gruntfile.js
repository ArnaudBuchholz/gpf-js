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
                    reporter: "dot",
                    quiet: false,
                    clearRequireCache: true,
                    require: [
                        function (){
                            global.gpfSourcesPath = "src/";
                        },
                        "./src/boot.js",
                        function (){
                            require("./test/host/console.js");
                            global.assert = require("assert");
                        }
                    ]
                },
                src: ["test/*.js"]
            },
            debug: {
                options: {
                    reporter: "dot",
                    quiet: false,
                    clearRequireCache: true,
                    require: [
                        function (){
                            global.gpf = require("./build/gpf-debug.js");
                            require("./test/host/console.js");
                            global.assert = require("assert");
                        }
                    ]
                },
                src: ["test/*.js"]
            },
            release: {
                options: {
                    reporter: "dot",
                    quiet: false,
                    clearRequireCache: true,
                    require: [
                        function (){
                            global.gpf = require("./build/gpf.js");
                            require("./test/host/console.js");
                            global.assert = require("assert");
                        }
                    ]
                },
                src: ["test/*.js"]
            }
        },
        //endregion
        //region Custom command lines
        exec: {
            testWscript: {
                command: "cscript.exe /D /E:JScript cscript.js",
                cwd: "test/host",
                stdout: false,
                stderr: false,
                exitCode: 0
            },
            testWscriptDebug: {
                command: "cscript.exe /D /E:JScript cscript.js -debug",
                cwd: "test/host",
                stdout: false,
                stderr: false,
                exitCode: 0
            },
            testWscriptRelease: {
                command: "cscript.exe /D /E:JScript cscript.js -release",
                cwd: "test/host",
                stdout: false,
                stderr: false,
                exitCode: 0
            },
            buildDebug: {
                command: "node node_make.js debug",
                cwd: "make",
                stdout: false,
                stderr: false,
                exitCode: 0
            },
            buildRelease: {
                command: "node node_make.js release",
                cwd: "make",
                stdout: false,
                stderr: false,
                exitCode: 0
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
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks("grunt-mocha");
    grunt.loadNpmTasks("grunt-mocha-test");

    grunt.registerTask("default", ["jshint"]);
    grunt.registerTask("make", [
        "jshint",
        "mocha:source",
        "mochaTest:source",
        "exec:testWscript",
        "exec:buildDebug",
        "exec:buildRelease",
        "mocha:debug",
        "mochaTest:debug",
        "exec:testWscriptDebug",
        "mocha:release",
        "mochaTest:release",
        "exec:testWscriptRelease"
    ]);
};