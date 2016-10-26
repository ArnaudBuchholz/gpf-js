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

    function log (msg) {
        if (console.expects) {
            console.expects("log", msg, true);
        }
        console.log(msg);
    }

    function error (msg) {
        if (console.expects) {
            console.expects("error", msg, true);
        }
        console.error(msg);
    }

    var MAX_WAIT = 50,
        loadedCallback,
        sourceIdx = 0,
        sources,
        includeReady = {};

    function _waitForTestCases (event) {
        if (event && "error" === event.type) {
            error(event.get("error").message);
            return;
        }
        while (sourceIdx < sources.length) {
            var source = sources[sourceIdx];
            ++sourceIdx;
            if (source.load !== false && source.test !== false) {
                gpf.web.include(window.gpfTestsPath + source.name + ".js", _waitForTestCases);
                return;
            }
        }
        // Everything is loaded
        loadedCallback();
    }

    /**
     * Actively wait for GPF to be loaded
     */
    function _waitForLoad () {
        // Check if the GPF library is loaded
        if ("undefined" === typeof gpf) {
            if (--MAX_WAIT) {
                window.setTimeout(_waitForLoad, 100);
            } else {
                error("Unable to load GPF");
            }
            return;
        }
        // Load sources
        var xhr = new XMLHttpRequest();
        xhr.open("GET", gpfSourcesPath + "sources.json");
        xhr.onreadystatechange = function () {
            if (4 === xhr.readyState) {
                sources = JSON.parse(xhr.responseText);
                _waitForTestCases();
            }
        };
        xhr.send();
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
        log("Using " + version + " version");
    }

    function _loadVersion () {
        var head = document.getElementsByTagName("head")[0],
            script = document.createElement("script");
        _detectVersion(script);
        script.language = "javascript";
        head.insertBefore(script, head.firstChild);
        _waitForLoad();
    }

    /*
     * Load the GPF framework and test cases.
     * When done, execute the callback.
     */
    window.load = function (callback) {
        loadedCallback = callback;
        _loadVersion();
    };

}());
