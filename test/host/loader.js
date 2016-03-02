/*eslint strict: [2, "function"]*/ // IIFE form
(function () {
    "use strict";

    /*global run*/ // From bdd.js

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
        if (configuration.load) {
            configuration.load(path);
        } else {
            var content = configuration.read(path);
            /*jslint evil: true*/
            eval(content); //eslint-disable-line no-eval
            /*jslint evil: false*/
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
        if (undefined === gpf.sources) {
            _load(configuration, _resolvePath(configuration, "src/sources.js"));
        }
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

    function _loadTests (configuration, options) {
        var sources,
            len,
            sourceIdx,
            source;
        if (options.tests.length) {
            sources = options.tests;
        } else {
            sources = gpf.sources();
        }
        len = sources.length;
        for (sourceIdx = 0; sourceIdx < len; ++sourceIdx) {
            source = sources[sourceIdx];
            if (!source) {
                break;
            }
            _loadTest(configuration, _resolvePath(configuration, "test/" + source + ".js"));
        }
    }

    function _runBDD (configuration, verbose) {
        if (false !== configuration.useBDD) {
            verbose("Running BDD");
            exit = configuration.exit; // used by BDD.js
            run();
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
     * - (Function) load optional if read specified, receives (filePath)
     * - (Function) read optional if load specified, receives (filePath)
     * - {Function} done
     * @private
     */
    context.loadGpfAndTests = function (configuration) {
        var options = {
                release: false,
                debug: false,
                verbose: false,
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
        verbose("Loading console");
        _load(configuration, _resolvePath(configuration, "test/host/console.js"));
        _loadTests(configuration, options, verbose);
        _runBDD(configuration, verbose);
        if (configuration.done) {
            configuration.done();
        }
        gpf.handleTimeout();
    };

}());
