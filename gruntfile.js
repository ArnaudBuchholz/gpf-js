"use strict";
/*jshint node: true*/
/*eslint-env node*/
/*eslint-disable no-sync*/ // OK here
module.exports = function (grunt) {

    var CSCRIPT_CMD = "cscript.exe /D /E:JScript test\\host\\cscript.js",
        RHINO_CMD = "java -jar node_modules\\rhino-1_7r5-bin\\rhino1_7R5\\js.jar test\\host\\rhino.js",
        PLATO_CMD = "node node_modules\\plato\\bin\\plato",
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
        //region Code coverage
        instrument: {
            files: "src/*.js",
            options: {
                lazy: true,
                debug: true,
                noCompact: true,
                noAutoWrap: true,
                basePath: "tmp/coverage/instrument/"
            }
        },
        storeCoverage: {
            options: {
                dir: "tmp/coverage/reports"
            }
        },
        makeReport: {
            src: "tmp/coverage/reports/**/*.json",
            options: {
                type: "lcov",
                dir: "tmp/coverage/reports",
                print: "detail"
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
                        function () {
                            global.gpfSourcesPath = "src/";
                        },
                        "./src/boot.js",
                        function () {
                            require("./test/host/console.js");
                            global.assert = require("assert");
                        }
                    ]
                },
                src: testFiles
            },
            verbose: {
                options: {
                    reporter: "spec",
                    quiet: false,
                    clearRequireCache: true,
                    require: [
                        function () {
                            global.gpfSourcesPath = "src/";
                        },
                        "./src/boot.js",
                        function () {
                            global.assert = require("assert");
                        }
                    ]
                },
                src: testFiles
            },
            coverage: {
                options: {
                    reporter: "progress",
                    quiet: false,
                    require: [
                        function () {
                            global.gpfSourcesPath = "tmp/coverage/instrument/src/";
                        },
                        "./tmp/coverage/instrument/src/boot.js",
                        function () {
                            global.assert = require("assert");
                        }
                    ]
                },
                src: testFiles
            },
            debug: {
                options: {
                    reporter: "dot",
                    quiet: false,
                    clearRequireCache: true,
                    require: [
                        function () {
                            global.gpf = require("./build/gpf-debug.js");
                            require("./test/host/console.js");
                            global.assert = require("assert");
                        }
                    ]
                },
                src: testFiles
            },
            release: {
                options: {
                    reporter: "dot",
                    quiet: false,
                    clearRequireCache: true,
                    require: [
                        function () {
                            global.gpf = require("./build/gpf.js");
                            require("./test/host/console.js");
                            global.assert = require("assert");
                        }
                    ]
                },
                src: testFiles
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
                command: PLATO_CMD + " -l .jshintrc -t GPF-JS -d tmp\\plato " + srcFiles.join(" "),
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

    [
        "grunt-contrib-jshint",
        "grunt-contrib-watch",
        "grunt-eslint",
        "grunt-exec",
        "grunt-istanbul",
        "grunt-istanbul-coverage",
        "grunt-mocha",
        "grunt-mocha-test"
    ].forEach(grunt.loadNpmTasks.bind(grunt));

    (function (tasks) {
        var taskName;
        for (taskName in tasks) {
            if (tasks.hasOwnProperty(taskName)) {
                grunt.registerTask(taskName, tasks[taskName]);
            }
        }
    }({
        "default": [
            "jshint",
            "eslint"
        ],
        "fixInstrument": function () {
            // Because code generation uses templates that are instrumented, the __cov_XXX variables must be global
            var fs = require("fs");
            srcFiles.forEach(function (fileName) {
                var srcPath = "tmp/coverage/instrument/" + fileName,
                    instrumentedLines = fs
                        .readFileSync(srcPath)
                        .toString()
                        .split("\n"),
                    // Assuming the __cov_ variable is on the second line
                    secondLine = instrumentedLines[1];
                if (0 === secondLine.indexOf("var ")) {
                    instrumentedLines[1] = "global." + secondLine.substr(4);
                    fs.writeFileSync(srcPath, instrumentedLines.join("\n"));
                    console.log(fileName + " updated");
                }
            });
        },
        "coverage": [
            "instrument",
            "fixInstrument",
            "mochaTest:coverage",
            "storeCoverage",
            "makeReport"
        ],
        "plato": ["exec:plato"],
        "make": [
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
        ]
    }));

};
