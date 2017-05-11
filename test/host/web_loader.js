/*eslint strict: [2, "function"]*/ // IIFE form
/*global xhr*/
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

    var MAX_WAIT = 50;

    function _setupConfig () {
        window.config = {};
        config.httpPort = parseInt(location.port, 10);
    }

    function _waitForTestCases (testFiles, callback) {
        function _testCaseLoaded (testCaseSource) {
            /*jshint -W061*/
            eval(testCaseSource); //eslint-disable-line no-eval
            /*jshint +W061*/
            _waitForTestCases(testFiles, callback);
        }
        if (testFiles.length) {
            xhr(testFiles.shift()).get()
                .then(_testCaseLoaded, error);
            return;
        }
        // Everything is loaded
        _setupConfig();
        callback();
    }

    function _detectLegacy () {
        var legacyVersion = (/version=([0-9\.]+)/).exec(window.location.search);
        if (legacyVersion) {
            return legacyVersion[1];
        }
    }

    // Actively wait for GPF to be loaded
    function _waitForLoad (callback) {
        // Check if the GPF library is loaded
        if ("undefined" === typeof gpf) {
            if (--MAX_WAIT) {
                setTimeout(function () {
                    _waitForLoad(callback);
                }, 100);
            } else {
                error("Unable to load GPF");
            }
            return;
        }
        // Legacy test case?
        var legacy = _detectLegacy();
        if (legacy) {
            delete gpf.internals;
            _waitForTestCases([window.gpfTestsPath + "legacy/" + legacy + ".js"], callback);
            return;
        }
        // Test files from sources.json
        var xhr = new XMLHttpRequest();
        xhr.open("GET", gpfSourcesPath + "sources.json");
        xhr.onreadystatechange = function () {
            if (4 === xhr.readyState) {
                _waitForTestCases(JSON.parse(xhr.responseText)
                    .filter(function (source) {
                        return source.load !== false && source.test !== false;
                    })
                    .map(function (source) {
                        return window.gpfTestsPath + source.name + ".js";
                    }), callback);
            }
        };
        xhr.send();
    }

    function _detectVersion () {
        var locationSearch = window.location.search,
            release = -1 < locationSearch.indexOf("release"),
            debug = -1 < locationSearch.indexOf("debug"),
            version,
            path;
        if (release) {
            version = "release";
            path = "../build/gpf.js";
        } else if (debug) {
            version = "debug";
            path = "../build/gpf-debug.js";
        } else {
            version = "sources";
            path = "boot.js";
        }
        log("Using " + version + " version");
        return path;
    }

    function _loadVersion (callback) {
        var head = document.getElementsByTagName("head")[0],
            script = document.createElement("script");
        script.src = gpfSourcesPath + _detectVersion();
        script.language = "javascript";
        head.insertBefore(script, head.firstChild);
        _waitForLoad(callback);
    }

    /*
     * Load the GPF framework and test cases.
     * When done, execute the callback.
     */
    window.load = function (callback) {
        _loadVersion(callback);
    };

}());
