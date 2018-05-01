/*eslint strict: [2, "function"]*/ // IIFE form
/*global xhr*/
(function () {
    "use strict";
    /*jshint browser: true*/
    /*eslint-env browser*/
    /*global __coverage__*/ // Coverage data

    function _safeConsoleMethod (method) {
        return function (msg) {
            if (console.expects) {
                console.expects(method, msg, true);
            }
            console[method](msg);
        };
    }

    var _log = _safeConsoleMethod("log"),
        _error = _safeConsoleMethod("error"),
        _MAX_WAIT = 50;

    function _waitForTestCases (testFiles, callback) {
        function _testCaseLoaded (testCaseSource) {
            /*jshint -W061*/
            eval(testCaseSource); //eslint-disable-line no-eval
            /*jshint +W061*/
            _waitForTestCases(testFiles, callback);
        }
        if (testFiles.length) {
            xhr(testFiles.shift()).get()
                .then(_testCaseLoaded, _error);
            return;
        }
        // Everything is loaded
        callback();
    }

    function _detectLegacy () {
        var legacyVersion = (/version=([0-9.]+)/).exec(window.location.search);
        if (legacyVersion) {
            return legacyVersion[1];
        }
    }

    function _patchLegacy (version) {
        // gpf is loaded
        return xhr("/test/legacy/legacy.json").get().asJson()
            .then(function (legacy) {
                return legacy.filter(function (item) {
                    return item.before > version;
                });
            })
            .then(function (legacy) {
                var
                    _describes = [],
                    _describe = window.describe,
                    _it = window.it;
                window.describe = function (label) {
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
                        _log("describe(\"" + label + "\", ...) ignored, see issue #" + issue);
                    } else {
                        _describes.unshift(label);
                        _describe.apply(this, arguments);
                        _describes.shift();
                    }
                };
                window.it = function (label) {
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
                        _log("it(\"" + label + "\", ...) ignored, see issue #" + issue);
                    } else {
                        _it.apply(this, arguments);
                    }
                };
            });
    }

    // Actively wait for GPF to be loaded
    function _waitForLoad (callback) {
        // Check if the GPF library is loaded
        if ("undefined" === typeof gpf) {
            if (--_MAX_WAIT) {
                setTimeout(function () {
                    _waitForLoad(callback);
                }, 100);
            } else {
                _error("Unable to load GPF");
            }
            return;
        }
        // Legacy test case?
        var legacy = _detectLegacy();
        if (legacy) {
            delete gpf.internals;
            _patchLegacy(legacy)
                .then(function () {
                    _waitForTestCases([window.gpfTestsPath + "legacy/" + legacy + ".js"], callback);
                });
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

    var _versions = {
        release: {
            label: "release",
            path: "../build/gpf.js"
        },
        debug: {
            label: "debug",
            path: "../build/gpf-debug.js"
        },
        coverage: {
            label: "instrumented sources",
            setup: function () {
                window.global = window;
                gpfSourcesPath += "../tmp/coverage/instrument/src/";
            }
        }
    };

    function _noop () {}

    function _getVersionParameters () {
        var locationSearch = location.search,
            version;
        for (version in _versions) {
            if (_versions.hasOwnProperty(version) && -1 !== locationSearch.indexOf(version)) {
                return _versions[version];
            }
        }
    }

    function _detectVersion () {
        var versionParameters = _getVersionParameters(),
            version,
            path = "boot.js";
        if (versionParameters) {
            version = versionParameters.label || version;
            path = versionParameters.path || "boot.js";
            (versionParameters.setup || _noop)();
        } else {
            version = "sources";
        }
        _log("Using " + version + " version");
        return path;
    }

    function _loadVersion (callback) {
        var head = document.getElementsByTagName("head")[0],
            script = document.createElement("script"),
            version = _detectVersion();
        script.src = gpfSourcesPath + version;
        script.language = "javascript";
        head.insertBefore(script, head.firstChild);
        _waitForLoad(callback);
    }

    function _setupConfig () {
        window.config = {};
        config.httpPort = parseInt(location.port, 10);
        var msie = (/(msie|trident)/i).test(navigator.userAgent);
        if (msie) {
            config.timerResolution = 5; // Found out that this is the only way to safely run tests
        }
    }

    /*
     * Load the GPF framework and test cases.
     * When done, execute the callback.
     */
    window.load = function (callback) {
        _setupConfig();
        _loadVersion(callback);
    };

    // Call it after tests to handle cached results & coverage storage
    window.afterRun = function (data) {
        var promise;
        // Store coverage data first
        if ("undefined" === typeof __coverage__) {
            promise = Promise.resolve();
        } else {
            promise = xhr("/fs/tmp/coverage/reports/coverage.browser.json").post(JSON.stringify(__coverage__));
        }
        // Check if result must be cached
        var match = (/cache=([0-9]+)/).exec(location.search);
        if (match) {
            promise.then(function () {
                // Will trigger closing of browser
                xhr("/cache/" + match[1]).post(JSON.stringify(data));
            });
        }
    };

}());
