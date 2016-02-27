/*eslint strict: [2, "function"]*/ // IIFE form
(function (context) {
    "use strict";

    /*global run*/ // From bdd.js

    /*global global*/ // NodeJS global
    if ("object" === typeof global) {
        context = global;
    }

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

    function _loadGpf (configuration, options, verbose) {
        if (options.release) {
            verbose("Using release version");
            configuration.require(_resolvePath(configuration, "build/gpf.js"));

        } else if (options.debug) {
            verbose("Using debug version");
            configuration.require(_resolvePath(configuration, "build/gpf-debug.js"));

        } else {
            verbose("Using source version");
            // Set the source path
            configuration.global.gpfSourcesPath = _resolvePath(configuration, "src/");
            configuration.load(_resolvePath(configuration, "src/boot.js"));
        }
        if (undefined === gpf.sources) {
            configuration.load(_resolvePath(configuration, "src/sources.js"));
        }
    }

    function _loadTests (configuration, options, verbose) {
        var sources,
            len,
            sourceIdx,
            source;
        verbose("Loading BDD");
        configuration.load(_resolvePath(configuration, "test/host/bdd.js"));
        verbose("Loading console");
        configuration.load(_resolvePath(configuration, "test/host/console.js"));
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
            configuration.load(_resolvePath(configuration, "test/" + source + ".js"));
        }
    }

    /**
     * @param {Object} configuration
     * - {Object} global global context
     * - {String[]} parameters command line parameters
     * - {String} gpfPath GPF base path
     * - {String} pathSeparator
     * - {Function} log
     * - {Function} exit
     * - (Function) require
     * - (Function) load
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
        if ("undefined" === typeof gpf) {
            configuration.log("GPF was not loaded");
            configuration.exit(-1);
        }
        _loadTests(configuration, options, verbose);
        verbose("Running BDD");
        exit = configuration.exit; // used by BDD.js
        run();
        gpf.handleTimeout();
    };

}(this));
