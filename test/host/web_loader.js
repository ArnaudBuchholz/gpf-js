/*eslint strict: [2, "function"]*/ // IIFE form
/*eslint-disable func-style*/ // So that everything is grouped in one var
/*global xhr*/
(function () {
    "use strict";
    /*jshint browser: true*/
    /*eslint-env browser*/
    /*global __coverage__*/ // Coverage data
    /*global gpfFlavors*/ // Flavors

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
        _MAX_WAIT = 50,
        _versions = {
            release: {
                label: "release",
                path: "../build/gpf.js",
                setup: function () {}
            },
            debug: {
                label: "debug",
                path: "../build/gpf-debug.js",
                setup: function () {}
            },
            coverage: {
                label: "instrumented sources",
                setup: function () {
                    window.global = window;
                    gpfSourcesPath += "../tmp/coverage/instrument/src/";
                }
            }
        },
        _tests,

        _evalTestCase = function (testFileURL, testCaseSource) {
            var sourceURL = window.location.toString().split("/test/")[0] + "/test/" + testFileURL;
            /*jshint -W061*/
            eval("//# sourceURL=" + sourceURL + "\n" + testCaseSource); //eslint-disable-line no-eval
            /*jshint +W061*/
        },

        _waitForTestCases = function (testFiles, callback) {
            var testFileURL;
            function _testCaseLoaded (testCaseSource) {
                _evalTestCase(testFileURL, testCaseSource);
                _waitForTestCases(testFiles, callback);
            }
            if (testFiles.length) {
                testFileURL = testFiles.shift();
                xhr(window.gpfTestsPath + testFileURL).get()
                    .then(_testCaseLoaded, _error);
                return;
            }
            // Everything is loaded
            callback();
        },

        _detectLegacy = function () {
            var legacyVersion = (/version=([0-9.]+)/).exec(window.location.search);
            if (legacyVersion) {
                return legacyVersion[1];
            }
        },

        _patchLegacy = function (version) {
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
        },

        // Actively wait for GPF to be loaded
        _waitForLoad = function (callback) {
            // Check if the GPF library is loaded
            if (typeof gpf === "undefined") {
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
                        _waitForTestCases(["legacy/" + legacy + ".js"], callback);
                    });
                return;
            }
            // GPF Library being loaded, Promises are existing (either natively or through compatiblity)
            var getTestFiles;
            if (_tests) {
                getTestFiles = Promise.resolve(_tests);
            } else {
                // Test files from sources.json
                getTestFiles = xhr(gpfSourcesPath + "sources.json").get().asJson()
                    .then(function (sources) {
                        return sources
                            .filter(function (source) {
                                return source.load !== false && source.test !== false;
                            })
                            .map(function (source) {
                                return source.name;
                            });
                    });
            }
            getTestFiles.then(function (files) {
                _waitForTestCases(files
                    .map(function (name) {
                        return name + ".js";
                    }), callback);
            });
        },

        buildFlavorSetup = function (flavor) {
            return function () {
                _tests = gpfFlavors[flavor].tests;
            };
        },

        _addFlavors = function () {
            var flavor;
            for (flavor in gpfFlavors) {
                if (gpfFlavors.hasOwnProperty(flavor)) {
                    _versions["flavor:" + flavor] = {
                        label: "\"" + flavor + "\" flavor",
                        path: "../build/gpf-" + flavor + ".js",
                        setup: buildFlavorSetup(flavor)
                    };
                }
            }
        },

        _getVersionParameters = function () {
            var locationSearch = location.search,
                version;
            if (typeof gpfFlavors !== "undefined") {
                _addFlavors();
            }
            for (version in _versions) {
                if (_versions.hasOwnProperty(version) && locationSearch.indexOf(version) !== -1) {
                    return _versions[version];
                }
            }
        },

        _detectVersion = function () {
            var versionParameters = _getVersionParameters(),
                version,
                path = "boot.js?map";
            if (versionParameters) {
                version = versionParameters.label;
                path = versionParameters.path || "boot.js";
                versionParameters.setup();
            } else {
                version = "sources";
            }
            _log("Using " + version + " version");
            return path;
        },

        _loadVersion = function (callback) {
            var head = document.getElementsByTagName("head")[0],
                script = document.createElement("script"),
                version = _detectVersion();
            script.src = gpfSourcesPath + version;
            script.language = "javascript";
            head.insertBefore(script, head.firstChild);
            _waitForLoad(callback);
        },

        _setupInclude = function () {
            window.include = function (source) {
                var path = window.gpfTestsPath + source + ".js";
                xhr(path, true).get()
                    .then(function (responseText) {
                        _evalTestCase(path, responseText);
                    });
            };
        },

        _setupConfig = function () {
            window.config = {};
            config.httpPort = parseInt(location.port, 10);
            var msie = (/(msie|trident)/i).test(navigator.userAgent);
            if (msie) {
                config.timerResolution = 5; // Found out that this is the only way to safely run tests
            }
            include("host/features");
        };

    /*
     * Load the GPF framework and test cases.
     * When done, execute the callback.
     */
    window.load = function (callback) {
        _setupInclude();
        _setupConfig();
        _loadVersion(callback);
    };

    // Call it after tests to handle cached results & coverage storage
    window.afterRun = function (data) {
        var promise;
        // Store coverage data first
        if (typeof __coverage__ === "undefined") {
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
