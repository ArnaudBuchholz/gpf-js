/*eslint strict: [2, "function"]*/ // IIFE form
/*eslint-disable func-style*/ // So that everything is grouped in one var
(function () {
    "use strict";

    /*global run, exit:true*/ // From bdd.js
    /*global __coverage__*/ // Coverage data

    var safeFunc = Function,
        sources,
        context = (function () {
            /*global global*/ // NodeJS global
            if (typeof global === "object") {
                return global;
            }
            /*global window*/ // Browser global
            if (typeof window !== "undefined") {
                return window;
            }
            return safeFunc("return this;")();
        }()),
        noTimeout = typeof setTimeout === "undefined",

        _resolvePath = function (configuration, relativePath) {
            return configuration.gpfPath
                .split(configuration.pathSeparator)
                .concat(relativePath.split("/"))
                .join(configuration.pathSeparator);
        },

        _processParameters = function (configuration, options) {
            var len = configuration.parameters.length,
                idx,
                value,
                option;
            for (idx = 0; idx < len; ++idx) {
                value = configuration.parameters[idx];
                if (value.charAt(0) === "-") {
                    value = value.substring(1);
                    option = options[value];
                    if (typeof option === "boolean") {
                        options[value] = !option; // Simple switch
                    } else if (typeof option === "function") {
                        option.call(options);
                    }
                } else {
                    options.tests.push(value);
                }
            }
            if (options.perfInfinite) {
                options.perf = true;
            }
        },

        _eval = function (configuration, path, content) {
            try {
                /*jslint evil: true*/
                eval(content); //eslint-disable-line no-eval
                /*jslint evil: false*/
            } catch (e) {
                configuration.log("An error occurred while evaluating: " + path + "\r\n" + e.message);
                configuration.log(e);
                configuration.exit(-1);
            }
        },

        _load = function (configuration, path) {
            _eval(configuration, path, configuration.read(path));
        },

        _requireGpf = function (configuration, path) {
            if (configuration.require) {
                context.gpf = configuration.require(path);
            } else {
                _load(configuration, path);
                if (typeof gpf === "undefined") {
                    configuration.log("GPF was not loaded");
                    configuration.exit(-1);
                }
            }
        },

        _loadGpf = function (configuration, options, verbose) {
            verbose("Using " + options.label + " version");
            if (options.build) {
                _requireGpf(configuration, _resolvePath(configuration, "build/" + options.build + ".js"));
            } else {
                if (!context.gpfSourcesPath) {
                    context.gpfSourcesPath = _resolvePath(configuration, "src/");
                }
                _load(configuration, gpfSourcesPath + "boot.js");
            }
            // Load the list of modules
            var sourcesJson = configuration.read("src/sources.json");
            sources = safeFunc("return " + sourcesJson + ";")();
        },

        _loadBDD = function (configuration, verbose) {
            if (undefined === configuration.run) {
                verbose("Loading BDD...");
                _load(configuration, _resolvePath(configuration, "test/host/bdd.js"));
                verbose("BDD loaded.");
            }
        },

        _loadTest = function (configuration, source) {
            var path = _resolvePath(configuration, "test/" + source + ".js");
            if (configuration.loadTest) {
                configuration.loadTest(path);
            } else {
                var testFileContent = configuration.read(path),
                    modifiedContent = testFileContent.replace(/[^."]assert\((.*)\);/g, function (match, test, offset) {
                        var lines = testFileContent.substring(0, offset).split("\n"),
                            lineNumber = lines.length,
                            pos = lines.pop().length + 1,
                            message = source + ".js@" + lineNumber + ":" + pos + ": " + test
                                .split("\\").join("\\\\")
                                .split("\"").join("\\\"");
                        return match.substring(0, match.length - 2) + ", \"" + message + "\");";
                    });
                _eval(configuration, path, modifiedContent);
            }
        },

        _patchLegacy = function (configuration, verbose, version) {
            // gpf is loaded
            var legacy = JSON.parse(configuration.read(_resolvePath(configuration, "test/legacy/legacy.json")))
                    .filter(function (item) {
                        return item.before > version;
                    }),
                _describes = [],
                _describe = context.describe,
                _it = context.it;
            context.describe = function (label) {
                var issue;
                legacy.every(function (item) {
                    if (item.ignore.some(function (ignore) {
                        return ignore.describe === label && !ignore.it;

                    })) {
                        issue = item.issue;
                        return false;
                    }
                    return true;
                });
                if (issue) {
                    verbose("describe(\"" + label + "\", ...) ignored, see issue #" + issue);
                } else {
                    _describes.unshift(label);
                    _describe.apply(this, arguments);
                    _describes.shift();
                }
            };
            context.it = function (label) {
                var issue;
                legacy.every(function (item) {
                    if (item.ignore.some(function (ignore) {
                        return ignore.describe === _describes[0] && ignore.it === label;

                    })) {
                        issue = item.issue;
                        return false;
                    }
                    return true;
                });
                if (issue) {
                    verbose("it(\"" + label + "\", ...) ignored, see issue #" + issue);
                } else {
                    _it.apply(this, arguments);
                }
            };
        },

        _setupInclude = function (configuration) {
            context.include = function (source) {
                _loadTest(configuration, source);
            };
        },

        _loadTestsFromNames = function (configuration, names, verbose) {
            var len = names.length,
                sourceIdx,
                source;
            for (sourceIdx = 0; sourceIdx < len; ++sourceIdx) {
                source = names[sourceIdx];
                if ((/^legacy(\\|\/)/).exec(source)) {
                    verbose("Legacy detected");
                    _patchLegacy(configuration, verbose, source.substring(7));
                    delete gpf.internals;
                }
                _loadTest(configuration, source);
            }
        },

        _loadTestsFromModules = function (configuration) {
            var len = sources.length,
                sourceIdx,
                source;
            for (sourceIdx = 0; sourceIdx < len; ++sourceIdx) {
                source = sources[sourceIdx];
                if (source.test !== false) {
                    _loadTest(configuration, source.name);
                }
            }
        },

        _loadTests = function (configuration, options, verbose) {
            try {
                if (options.tests.length) {
                    verbose("Loading specified test files...");
                    _loadTestsFromNames(configuration, options.tests, verbose);
                } else {
                    verbose("Loading all test files...");
                    _loadTestsFromModules(configuration);
                }
            } catch (e) {
                configuration.log("An error occurred while loading tests: " + e.message);
                configuration.log(e);
                configuration.exit(-1);
            }
        },

        _setupConfig = function (configuration, options) {
            var configFile = JSON.parse(configuration.read(_resolvePath(configuration, "tmp/config.json")));
            context.config = Object.assign({
                httpPort: configFile.serve.httpPort,
                testPath: "test/",
                performance: options.perf
            }, configuration.config || {});
            _load(configuration, _resolvePath(configuration, "test/host/features.js"));
            _setupInclude(configuration);
        },

        _mean = function (values) {
            var total = 0,
                len = values.length,
                idx;
            for (idx = 0; idx < len; ++idx) {
                total += values[idx];
            }
            return Math.floor(total / len);
        },

        _stdDeviation = function (values) {
            var mean = _mean(values),
                total = 0,
                len = values.length,
                idx,
                diff;
            for (idx = 0; idx < len; ++idx) {
                diff = values[idx] - mean;
                total += diff * diff;
            }
            return Math.floor(Math.sqrt(total / len));
        },

        _pad = function (value, size) {
            var pad = size - value.toString().length;
            if (pad > 0) {
                return new Array(pad).join(" ") + value;
            }
            return value;
        },

        _perfError = function (configuration, data) {
            configuration.log("ERROR during performance test:");
            var property,
                value;
            for (property in data) {
                if (data.hasOwnProperty(property)) {
                    value = data[property];
                    if (property === "exception" && value instanceof Error) {
                        configuration.log("\t" + _pad(property, 10) + ": " + value.message);
                    } else {
                        configuration.log("\t" + _pad(property, 10) + ": " + value.toString());
                    }
                }
            }
        },

        _defaultTimer = function () {
            return {
                start: function () {
                    var now = new Date();
                    this._start = now;
                    this._lap = now;
                },
                lap: function () {
                    var now = new Date(),
                        result = now - this._lap;
                    this._lap = now;
                    return result;
                },
                stop: function () {
                    var now = new Date();
                    return now - this._start;
                }
            };
        },

        _runBDDPerf = function (configuration, options) {
            var loop = 1,
                maxLoop,
                runWithCallback,
                measures = [],
                timer = configuration.getTimer && configuration.getTimer() || _defaultTimer();
            if (options.perfInfinite) {
                maxLoop = Math.MAX_SAFE_INTEGER;
            } else {
                maxLoop = 10;
            }
            function callback (type, data) {
                var statistics;
                if (type === "it") {
                    if (!data.result) {
                        _perfError(configuration, data);
                        maxLoop = 0; // Stop
                    }
                } else if (type === "results") {
                    var timeSpent = timer.stop();
                    statistics = ["Round ", _pad(loop, 9), ": ", _pad(timeSpent, 5), "ms "];
                    if (loop === 1) {
                        statistics.push("(ignored)");
                    } else {
                        measures.push(timeSpent);
                        statistics.push("mean: ", _pad(_mean(measures), 5), "ms ",
                            "deviation: ", _pad(_stdDeviation(measures), 5));
                    }
                    configuration.log(statistics.join(""));
                    if (maxLoop < loop) {
                        configuration.log("Mean time: " + _mean(measures) + "ms");
                    } else {
                        ++loop;
                        setTimeout(runWithCallback, 0);
                    }
                }
            }
            runWithCallback = function () {
                timer.start();
                run(callback);
            };
            runWithCallback();
        },

        _updloadCoverage = function () {
            var coverageData = JSON.stringify(__coverage__),
                pos = 0,
                length = coverageData.length,
                chunkSize = 4096,
                method = gpf.http.methods.post,
                url = "http://localhost:" + config.httpPort + "/fs/tmp/coverage/reports/coverage."
                    + gpf.host() + ".json";
            function upload () {
                return gpf.http.request({
                    method: method,
                    url: url,
                    data: coverageData.substring(pos, pos + chunkSize)
                })
                    .then(function () {
                        method = gpf.http.methods.put;
                        pos += chunkSize;
                        if (pos < length) {
                            return upload();
                        }
                    });
            }
            return upload();
        },

        _runBDDForCoverage = function (configuration, options, verbose) {
            verbose("Running BDD - coverage");
            run(function (type, data) {
                if (type === "it" && !data.result) {
                    configuration.log("KO: " + data.context.slice(1) + " " + data.label);
                }
                if (type !== "results") {
                    return;
                }
                if (data.fail) {
                    configuration.log("Failed: " + data.fail + ".");
                    configuration.exit(-1);
                }
                verbose("Uploading coverage results...");
                _updloadCoverage()
                    .then(function () {
                        verbose("Coverage results uploaded.");
                        configuration.exit(0);
                    }, function (reason) {
                        configuration.log("Upload failed: " + reason.toString());
                        configuration.exit(-1);
                    });
            });
        },

        _runBDD = function (configuration, options, verbose) {
            exit = configuration.exit; // used by BDD.js
            if (options.perf) {
                verbose("Running BDD - performances");
                _runBDDPerf(configuration, options);
            } else if (options.runCoverage) {
                _runBDDForCoverage(configuration, options, verbose);
            } else {
                verbose("Running BDD");
                run();
            }
        },

        _safeRunBDD = function (configuration, options, verbose) {
            try {
                if (undefined === configuration.run) {
                    _runBDD(configuration, options, verbose);
                } else {
                    configuration.run();
                }
                if (noTimeout) {
                    gpf.handleTimeout();
                }
            } catch (e) {
                configuration.log("An error occurred while running the tests:\r\n" + e.message);
                configuration.exit(-1);
            }
        },

        _loadFlavor = function (configuration, options) {
            // Load the list of modules
            var
                flavorName = options.tests[0].substring(7),
                flavorJson = configuration.read("make/flavor/" + flavorName + ".json"),
                flavor = safeFunc("return " + flavorJson + ";")();
            options.build = "gpf-" + flavorName;
            options.label = "\"" + options.flavor + "\" flavor";
            options.tests = flavor.tests;
        },

        _checkFlavor = function (configuration, options) {
            if (options.tests.length === 1 && options.tests[0].indexOf("flavor:") === 0) {
                _loadFlavor(configuration, options);
            }
        };

    /*
     * Expected members on configuration:
     * - {String[]} parameters command line parameters
     * - {String} gpfPath GPF base path
     * - {String} pathSeparator
     * - {Function} log
     * - {Function} exit
     * - (Function) require
     * - (Function) read  function (filePath) {} reads a file
     * - (Function) [loadTest] loadTest function (filePath) {} reads a test file
     * - {Function} run When defined, this method is triggered to execute the tests
     * - {Function} [getTimer] get host specific timer (must expose start, stop, lap)
     */
    context.loadGpfAndTests = function (configuration) {
        var options = {
                build: "",
                label: "source",
                release: function () {
                    this.build = "gpf";
                    this.label = "release";
                },
                debug: function () {
                    this.build = "gpf-debug";
                    this.label = "debug";
                },
                coverage: function () {
                    this.ignoreConsole = true;
                    this.label = "*instrumented* source";
                    this.runCoverage = true;
                    context.global = context;
                    context.gpfSourcesPath = _resolvePath(configuration, "tmp/coverage/instrument/src/");
                },
                verbose: false,
                ignoreConsole: false,
                perf: false,
                perfInfinite: false,
                tests: []
            },
            verbose;
        _processParameters(configuration, options);
        // Define a debug function that outputs when verbose is set
        if (options.verbose) {
            verbose = configuration.log;
        } else {
            verbose = function () {};
        }
        _checkFlavor(configuration, options);
        _loadGpf(configuration, options, verbose);
        _loadBDD(configuration, verbose);
        if (!options.ignoreConsole) {
            verbose("Loading console...");
            _load(configuration, _resolvePath(configuration, "test/host/console.js"));
            verbose("Console loaded.");
        }
        _setupConfig(configuration, options);
        _loadTests(configuration, options, verbose);
        _safeRunBDD(configuration, options, verbose);
    };

}());
