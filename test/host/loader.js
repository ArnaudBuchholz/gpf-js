/*eslint strict: [2, "function"]*/ // IIFE form
/*eslint-disable func-style*/ // So that everything is grouped in one var
(function () {
    "use strict";

    /*global run, exit:true*/ // From bdd.js
    /*global __coverage__*/ // Coverage data

    var Func = Function,
        sources,
        context = (function () {
            /*global global*/ // NodeJS global
            if ("object" === typeof global) {
                return global;
            }
            /*global window*/ // Browser global
            if ("undefined" !== typeof window) {
                return window;
            }
            return this; //eslint-disable-line no-invalid-this
        }()),

        _resolvePath = function (configuration, relativePath) {
            return configuration.gpfPath
                .split(configuration.pathSeparator)
                .concat(relativePath.split("/"))
                .join(configuration.pathSeparator);
        },

        _processParameters = function (configuration, options) {
            var len = configuration.parameters.length,
                idx,
                value;
            for (idx = 0; idx < len; ++idx) {
                value = configuration.parameters[idx];
                if (value.charAt(0) === "-") {
                    value = value.substr(1);
                    if (value in options && "boolean" === typeof options[value]) {
                        options[value] = !options[value]; // Simple switch
                    }
                } else {
                    options.tests.push(value);
                }
            }
            if (options.perfInfinite) {
                options.perf = true;
            }
        },

        _load = function (configuration, path) {
            var content = configuration.read(path);
            try {
                /*jslint evil: true*/
                eval(content); //eslint-disable-line no-eval
                /*jslint evil: false*/
            } catch (e) {
                configuration.log("An error occurred while evaluating: " + path + "\r\n" + e.message);
                configuration.exit(-1);
            }
        },

        _requireGpf = function (configuration, path) {
            if (configuration.require) {
                context.gpf = configuration.require(path);
            } else {
                _load(configuration, path);
                if ("undefined" === typeof gpf) {
                    configuration.log("GPF was not loaded");
                    configuration.exit(-1);
                }
            }
        },

        _loadGpf = function (configuration, options, verbose) {
            if (options.release) {
                verbose("Using release version");
                _requireGpf(configuration, _resolvePath(configuration, "build/gpf.js"));

            } else if (options.debug) {
                verbose("Using debug version");
                _requireGpf(configuration, _resolvePath(configuration, "build/gpf-debug.js"));

            } else {
                if (options.coverage) {
                    verbose("Using *instrumented* source version");
                    context.global = context;
                    context.gpfSourcesPath = _resolvePath(configuration, "tmp/coverage/instrument/src/");

                } else {
                    verbose("Using source version");
                    context.gpfSourcesPath = _resolvePath(configuration, "src/");
                }
                _load(configuration, gpfSourcesPath + "boot.js");
            }
            // Load the list of modules
            var sourcesJson = configuration.read("src/sources.json");
            sources = new Func("return " + sourcesJson + ";")();
        },

        _loadBDD = function (configuration, verbose) {
            if (undefined === configuration.run) {
                verbose("Loading BDD...");
                _load(configuration, _resolvePath(configuration, "test/host/bdd.js"));
                verbose("BDD loaded.");
            }
        },

        _loadTest = function (configuration, path) {
            if (configuration.loadTest) {
                configuration.loadTest(path);
            } else {
                _load(configuration, path);
            }
        },

        _loadTestsFromNames = function (configuration, names) {
            var len = names.length,
                sourceIdx,
                source;
            for (sourceIdx = 0; sourceIdx < len; ++sourceIdx) {
                source = names[sourceIdx];
                if (source.indexOf("legacy/") === 0) {
                    delete gpf.internals;
                }
                _loadTest(configuration, _resolvePath(configuration, "test/" + source + ".js"));
            }
        },

        _loadTestsFromModules = function (configuration) {
            var len = sources.length,
                sourceIdx,
                source;
            for (sourceIdx = 0; sourceIdx < len; ++sourceIdx) {
                source = sources[sourceIdx];
                if (source.load !== false && source.test !== false) {
                    _loadTest(configuration, _resolvePath(configuration, "test/" + source.name + ".js"));
                }
            }
        },

        _loadTests = function (configuration, options, verbose) {
            verbose("Loading test files...");
            if (options.tests.length) {
                _loadTestsFromNames(configuration, options.tests);
            } else {
                _loadTestsFromModules(configuration);
            }
            verbose("Test files loaded.");
        },

        _setupConfig = function (configuration/*, options*/) {
            var configFile = JSON.parse(configuration.read("tmp/config.json"));
            context.config = {
                httpPort: configFile.serve.httpPort
            };
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

        _runBDDPerf = function (configuration, options) {
            var loop = 1,
                maxLoop,
                runWithCallback,
                measures = [];
            if (options.perfInfinite) {
                maxLoop = Math.MAX_SAFE_INTEGER;
            } else {
                maxLoop = 10;
            }
            function callback (type, data) {
                var statistics;
                if ("it" === type) {
                    if (!data.result) {
                        configuration.log("ERROR: " + JSON.stringify(data));
                        maxLoop = 0; // Stop
                    }
                } else if ("results" === type) {
                    statistics = ["Round ", _pad(loop, 9), ": ", _pad(data.timeSpent, 5), "ms "];
                    if (1 === loop) {
                        statistics.push("(ignored)");
                    } else {
                        measures.push(data.timeSpent);
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
                run(callback);
            };
            runWithCallback();
        },

        _runBDDForCoverage = function (configuration, options, verbose) {
            verbose("Running BDD - coverage");
            run(function (type, data) {
                if ("results" !== type) {
                    return;
                }
                if (data.fail) {
                    verbose("Failed: " + data.fail + ".");
                    exit(-1);
                }
                verbose("Uploading coverage results...");
                gpf.http.request({
                    method: gpf.http.methods.post,
                    url: "http://localhost:" + config.httpPort + "/fs/tmp/coverage/reports/coverage."
                        + gpf.host() + ".json",
                    data: JSON.stringify(__coverage__)
                })
                    .then(function () {
                        verbose("Coverage results uploaded.");
                        exit(0);
                    }, function (reason) {
                        verbose("Upload failed: " + reason.toString());
                        exit(-1);
                    });
            });
        },

        _runBDD = function (configuration, options, verbose) {
            exit = configuration.exit; // used by BDD.js
            if (options.perf) {
                verbose("Running BDD - performances");
                _runBDDPerf(configuration, options);
            } else if (options.coverage) {
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
                gpf.handleTimeout();
            } catch (e) {
                configuration.log("An error occurred while running the tests:\r\n" + e.message);
                configuration.exit(-1);
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
     * - (Function) [loadTest=undefined] loadTest function (filePath) {} reads a test file
     * - {Function} run When defined, this method is triggered to execute the tests
     */
    context.loadGpfAndTests = function (configuration) {
        var options = {
                release: false,
                debug: false,
                coverage: false,
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
