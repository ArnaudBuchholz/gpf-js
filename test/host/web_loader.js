/*eslint strict: [2, "function"]*/ // IIFE form
(function () {
    "use strict";
    /*jshint browser: true*/
    /*eslint-env browser*/

    if (!window.gpfSourcesPath) {
        window.gpfSourcesPath = "../../src/";
    }
    if (!window.gpfTestsPath) {
        window.gpfTestsPath = "../";
    }

    var
        loadedCallback,
        dependencyIdx = -1,
        dependencies,
        sourceIdx = -1,
        sources,
        includeReady = {};

    function _waitForTestCases () {
        // Load test cases that are named like sources
        if (-1 === sourceIdx) {
            sources = gpf.sources();
            sourceIdx = 0;
        }
        if (sourceIdx < sources.length) {
            var source = sources[sourceIdx];
            if (source) {
                gpf.web.include(window.gpfTestsPath + source + ".js", includeReady);
                ++sourceIdx;
                return;
            }
        }
        // Everything is loaded
        loadedCallback();
    }

    function _waitForDependencies () {
        // Check if any dependencies
        if (-1 === dependencyIdx) {
            dependencyIdx = 0;
        }
        if (dependencyIdx < dependencies.length) {
            gpf.web.include(dependencies[dependencyIdx], includeReady);
            ++dependencyIdx;
            return;
        }
        // Check if console override is defined
        if (undefined === console.expects) {
            gpf.web.include(window.gpfTestsPath + "host/console.js", includeReady);
            return;
        }
        _waitForTestCases();
    }

    /**
     * Actively wait for GPF to be loaded
     */
    function _waitForLoad () {
        // Check if the GPF library is loaded
        if ("undefined" === typeof gpf || !gpf.loaded()) {
            console.log("GPF not loaded yet...");
            window.setTimeout(_waitForLoad, 100);
            return;
        }
        // Check if sources are loaded
        if (!gpf.sources) {
            console.log("Missing sources");
            gpf.web.include(gpfSourcesPath + "sources.js", {
                ready: _waitForLoad
            });
            return;
        }
        _waitForDependencies();
    }

    includeReady.ready = _waitForLoad;

    function _detectVersion (script) {
        var locationSearch,
            release,
            debug,
            version;
        if (window.gpfVersion) {
            locationSearch = window.gpfVersion;
        } else {
            locationSearch = window.location.search;
        }
        release = -1 < locationSearch.indexOf("release");
        debug = -1 < locationSearch.indexOf("debug");
        if (release) {
            version = "release";
            script.src = gpfSourcesPath + "../build/gpf.js";
        } else if (debug) {
            version = "debug";
            script.src = gpfSourcesPath + "../build/gpf-debug.js";
        } else {
            version = "sources";
            script.src = gpfSourcesPath + "boot.js";
        }
        console.log("Using " + version + " version");
    }

    function _loadVersion () {
        var head = document.getElementsByTagName("head")[0],
            script = document.createElement("script");
        _detectVersion(script);
        script.language = "javascript";
        head.insertBefore(script, head.firstChild);
        _waitForLoad();
    }

    /**
     * Load the GPF framework and test cases.
     * When done, execute the callback.
     *
     * @param {String[]|String} [additionalDependencies=undefined]
     * @param {Function} callback
     */
    window.load = function (additionalDependencies, callback) {
        if (undefined !== callback) {
            if (!(additionalDependencies instanceof Array)) {
                additionalDependencies = [additionalDependencies];
            }
            dependencies = additionalDependencies;
        } else {
            dependencies = [];
            callback = additionalDependencies;
        }
        loadedCallback = callback;
        _loadVersion();
    };

}());
