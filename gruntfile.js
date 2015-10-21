"use strict";
/*jshint node: true*/
/*eslint-env node*/
module.exports = function (grunt) {

    var CSCRIPT_CMD = "cscript.exe /D /E:JScript test\\host\\cscript.js",
        RHINO_CMD = "java -jar node_modules\\rhino-1_7r5-bin\\rhino1_7R5\\js.jar test\\host\\rhino.js",
        srcFiles = [],
        testFiles = [],
        jsLintedFiles;

    // Build the list of valid source files based on sources.js
    require("./src/sources.js");
    gpf.sources().every(function (name) {
        if (name) {
            srcFiles.push("src/" + name + ".js");
            testFiles.push("test/" + name + ".js");
            return true;
        }
        return false;
    });

    jsLintedFiles = [
        "Gruntfile.js",
        ".eslintrules/*.js",
        "make/*.js",
        "test/host/*.js",
        "test/host/mocha/nodejs.js"
    ]
        .concat(srcFiles)
        .concat(testFiles);

    require("load-grunt-tasks")(grunt);

    grunt.initConfig({
        //region JavaScript linters
        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },
            files: jsLintedFiles.concat("make/*.json")
        },
        eslint: {
            options: {
                configFile: ".eslintrc",
                rulePaths: [".eslintrules"]
            },
            target: jsLintedFiles
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
            testRhino: {
                command: RHINO_CMD,
                stdout: false,
                stderr: false,
                exitCode: 0
            },
            testRhinoVerbose: {
                command: RHINO_CMD,
                stdout: true,
                stderr: true,
                exitCode: 0
            },
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
                command: "node make.js debug",
                cwd: "make",
                stdout: false,
                stderr: false,
                exitCode: 0
            },
            buildRelease: {
                command: "node make.js release",
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
    grunt.loadNpmTasks("grunt-eslint");
    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks("grunt-mocha");
    grunt.loadNpmTasks("grunt-mocha-test");

    grunt.registerTask("default", ["jshint"]);
    grunt.registerTask("make", [
        "jshint",
        "eslint",
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
