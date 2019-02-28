"use strict";

const
    clearRequireCache = () => {
        Object.keys(require.cache).forEach(key => delete require.cache[key]);
    },

    setup = (sourcesPath) => {
        clearRequireCache();
        global.gpfSourcesPath = sourcesPath;
        global.assert = require("assert");
        global.config = {
            httpPort: configuration.serve.httpPort,
            testPath: "test/",
            timerResolution: 5
        };
        global.include = source => require(`../test/${source}.js`);
        require("../test/host/features");
    };

// Test automation inside NodeJS
module.exports = (grunt) => {
    return {
        source: {
            options: {
                reporter: "dot",
                quiet: false,
                require: [
                    () => {
                        setup("src/");
                    },
                    "./src/boot.js",
                    () => {
                        if (grunt.task.current.args.includes("noConsole")) {
                            gpf.preventAssertWarnings(true);
                        } else {
                            require("../test/host/console.js");
                        }
                    }
                ]
            },
            src: configuration.files.test
        },
        verbose: {
            options: {
                reporter: "spec",
                quiet: false,
                require: [
                    () => {
                        setup("src/");
                    },
                    "./src/boot.js"
                ]
            },
            src: configuration.files.test
        },
        coverage: {
            options: {
                reporter: "json",
                captureFile: "./tmp/coverage/mochaTest.json",
                quiet: true,
                require: [
                    () => {
                        setup("tmp/coverage/instrument/src/");
                    },
                    "./tmp/coverage/instrument/src/boot.js",
                    () => {
                        require("../test/host/console.js");
                    }
                ]
            },
            src: configuration.files.test
        },
        debug: {
            options: {
                reporter: "dot",
                quiet: false,
                require: [
                    () => {
                        setup();
                        global.gpf = require("../build/gpf-debug.js");
                        require("../test/host/console.js");
                    }
                ]
            },
            src: configuration.files.test
        },
        release: {
            options: {
                reporter: "dot",
                quiet: false,
                require: [
                    () => {
                        setup();
                        global.gpf = require("../build/gpf.js");
                        require("../test/host/console.js");
                    }
                ]
            },
            src: configuration.files.test
        },
        legacy: {
            options: {
                reporter: "dot",
                quiet: false,
                require: [
                    () => {
                        setup("src/");
                    },
                    "./src/boot.js",
                    () => {
                        require("../test/host/console.js");
                        delete gpf.internals;
                    }
                ]
            },
            src: "test/legacy/<%= grunt.task.current.args[0] %>.js"
        }
    };
};
