module.exports = function (grunt) {
    "use strict";

    var CSCRIPT_CMD = "cscript.exe /D /E:JScript test\\host\\cscript.js",
        srcFiles = [],
        testFiles = [];

    // Build the list of valid source files based on sources.js
    global.gpf = {};
    require("./src/sources.js");
    gpf.sources().every(function (name) {
        if (name) {
            srcFiles.push("src/" + name + ".js");
            testFiles.push("test/" + name + ".js");
            return true;
        }
        return false;
    });

    grunt.initConfig({
        //region JavaScript linter
        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },
            files: [
                "Gruntfile.js",
                "make/make.js",
                "make/node_make.js",
                "make/*.json",
                "make/UMD.js",
                "test/host/*.js",
                "test/host/mocha/nodejs.js"

            ]   .concat(srcFiles)
                .concat(testFiles)
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
                command: CSCRIPT_CMD,
                stdout: false,
                stderr: false,
                exitCode: 0
            },
            testWscriptVerbose: {
                command: CSCRIPT_CMD,
                stdout: true,
                stderr: true,
                exitCode: 0
            },
            testWscriptDebug: {
                command: CSCRIPT_CMD + " -debug",
                stdout: false,
                stderr: false,
                exitCode: 0
            },
            testWscriptRelease: {
                command: CSCRIPT_CMD + " -release",
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
            },
            plato: {
                command: "plato -l .jshintrc -t GPF-JS -d tmp\\plato src\\*.js",
                stdout: true,
                stderr: true
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