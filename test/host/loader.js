/*eslint strict: [2, "function"]*/ // IIFE form
(function () { //eslint-disable-line max-statements
    "use strict";

    /*global run*/ // From bdd.js

    var Func = Function,
        sources;

    var context = (function () {
        /*global global*/ // NodeJS global
        if ("object" === typeof global) {
            return global;
        }
        /*global window*/ // Browser global
        if ("undefined" !== typeof window) {
            return window;
        }
        return this; //eslint-disable-line no-invalid-this
    }());

    function _resolvePath (configuration, relativePath) {
        return configuration.gpfPath
            .split(configuration.pathSeparator)
            .concat(relativePath.split("/"))
            .join(configuration.pathSeparator);
    }

    function _processParameters (configuration, options) {
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
    }

    function _load (configuration, path) {
        var content = configuration.read(path);
        try {
            /*jslint evil: true*/
            eval(content); //eslint-disable-line no-eval
            /*jslint evil: false*/
        } catch (e) {
            configuration.log("An error occurred while evaluating: " + path + "\r\n" + e.message);
            configuration.exit(-1);
        }
    }

    function _requireGpf (configuration, path) {
        if (configuration.require) {
            context.gpf = configuration.require(path);
        } else {
            _load(configuration, path);
            if ("undefined" === typeof gpf) {
                configuration.log("GPF was not loaded");
                configuration.exit(-1);
            }
        }
    }

    function _loadGpf (configuration, options, verbose) {
        if (options.release) {
            verbose("Using release version");
            _requireGpf(configuration, _resolvePath(configuration, "build/gpf.js"));

        } else if (options.debug) {
            verbose("Using debug version");
            _requireGpf(configuration, _resolvePath(configuration, "build/gpf-debug.js"));

        } else {
            verbose("Using source version");
            // Set the source path
            context.gpfSourcesPath = _resolvePath(configuration, "src/");
            _load(configuration, _resolvePath(configuration, "src/boot.js"));
        }
        // Load the list of modules
        var sourcesJson = configuration.read("src/sources.json");
        sources = new Func("return " + sourcesJson + ";")();
    }

    function _loadBDD (configuration, verbose) {
        if (false !== configuration.useBDD) {
            verbose("Loading BDD");
            _load(configuration, _resolvePath(configuration, "test/host/bdd.js"));
        }
    }

    function _loadTest (configuration, path) {
        if (configuration.loadTest) {
            configuration.loadTest(path);
        } else {
            _load(configuration, path);
        }
    }

    function loadTestsFromNames (configuration, names) {
        var len = names.length,
            sourceIdx,
            source;
        for (sourceIdx = 0; sourceIdx < len; ++sourceIdx) {
            source = names[sourceIdx];
            _loadTest(configuration, _resolvePath(configuration, "test/" + source + ".js"));
        }
    }

    function loadTestsFromModules (configuration) {
        var len = sources.length,
            sourceIdx,
            source;
        for (sourceIdx = 0; sourceIdx < len; ++sourceIdx) {
            source = sources[sourceIdx];
            if (source.load !== false && source.test !== false) {
                _loadTest(configuration, _resolvePath(configuration, "test/" + source.name + ".js"));
            }
        }
    }

    function _loadTests (configuration, options) {
        if (options.tests.length) {
            loadTestsFromNames(configuration, options.tests);
        } else {
            loadTestsFromModules(configuration);
        }
    }

    function _runBDD (configuration, verbose) {
        if (false !== configuration.useBDD) {
            verbose("Running BDD");
            exit = configuration.exit; // used by BDD.js
            run();
        }
    }

    function _safeRunBDD (configuration, verbose) {
        try {
            _runBDD(configuration, verbose);
            if (configuration.done) {
                configuration.done();
            }
            gpf.handleTimeout();
        } catch (e) {
            configuration.log("An error occurred while running the tests:\r\n" + e.message);
            configuration.exit(-1);
        }
    }

    /**
     * @param {Object} configuration
     * - {String[]} parameters command line parameters
     * - {String} gpfPath GPF base path
     * - {String} pathSeparator
     * - {Boolean} useBDD
     * - {Function} log
     * - {Function} exit
     * - (Function) require
     * - (Function) read  function (filePath) {} reads a file
     * - (Function) [loadTest=undefined] loadTest function (filePath) {} reads a test file
     * - {Function} done
     * @private
     */
    context.loadGpfAndTests = function (configuration) {
        var options = {
                release: false,
                debug: false,
                verbose: false,
                ignoreConsole: false,
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
            verbose("Loading console");
            _load(configuration, _resolvePath(configuration, "test/host/console.js"));
        }
        _loadTests(configuration, options, verbose);
        _safeRunBDD(configuration, verbose);
    };

}());
