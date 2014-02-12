(function () { /* Begin of privacy scope */
    "use strict";

    /*
     * Detect host * & define global context
     */
    var
        _host,
        _context,
        _loaded,
        _loadCallbacks = [],
        _finishLoading = function () {
            _loaded = true;
            while (_loadCallbacks.length) {
                _loadCallbacks.shift()();
            }
        };

    // Microsoft cscript / wscript
    if ("undefined" !== typeof WScript) {
        _host = "wscript";
        _context = (function () {return this; }).apply(null, []);

        // Define console APIs
        _context.console = {
            log: function (t) {WScript.Echo("    " + t);},
            info: function (t) {WScript.Echo("[?] " + t);},
            warn: function (t) {WScript.Echo("/!\\ " + t);},
            error: function (t) {WScript.Echo("(X) " + t);}
        };

    // Nodejs
    } else if ("undefined" !== typeof module && module.exports) {
        _host = "nodejs";
        _context = global;
    // Default: browser
    } else {
        _host = "browser";
        _context = window;
    }

    /*
     * Main namespace & primitives
     */
    _context.gpf = {

        host: function () {
            return _host;
        },

        context: function () {
            return _context;
        },

        loaded: function (callback) {
            if (callback) {
                if (_loaded) {
                    callback();
                } else {
                    _loadCallbacks.push(callback);
                }
            }
            return _loaded;
        }

    };

    gpf.NOT_IMPLEMENTED = function () {
        console.error("Not implemented");
        throw "Not implemented";
    };

    /*
     * Handling external options
     * TODO: provide ways to turn on/off features by adding options
     */

/*#ifdef(DEBUG)*/
    // DEBUG specifics

    gpf.ASSERT = function (condition, message) {
        if (!condition) {
            console.warn("ASSERTION FAILED: " + message);
            throw {
                message: "ASSERTION FAILED: " + message
            };
        }
    };
/*#endif*/

/*#ifdef(BOOT)*/

    /*
     * Loading sources occurs here because the release version will have
     * everything embedded.
     */
    if ("wscript" === _host) {
        /*
         * Use FSO and eval
         */
        (function () {
            var
                fso = new ActiveXObject("Scripting.FileSystemObject"),
                include = function (src) {
                    /*global gpfSourcesPath*/ // Tested below
                    if ("undefined" !== typeof gpfSourcesPath) {
                        src = gpfSourcesPath + src;
                    }
                    var srcFile = fso.OpenTextFile(src);
                    /*jslint evil: true*/
                    // No other choice to evaluate in the current context
                    eval(srcFile.ReadAll());
                    /*jslint evil: false*/
                    srcFile.Close();
                },
                sources,
                idx;
            include("sources.js");
            sources = gpf.sources().split(",");
            for (idx = 0; idx < sources.length; ++idx) {
                include(sources[idx] + ".js");
            }
            _finishLoading();
        }());

    } else if ("nodejs" === _host) {
        /*
         * This is probably the simplest part: use require
         */
        require("./sources.js");
        (function () {
            var
                sources = gpf.sources().split(","),
                idx;
            for (idx = 0; idx < sources.length; ++idx) {
                require("./" + sources[idx] + ".js");
            }
            _finishLoading();
        }());

    } else { // "browser" === _host
        /*
         * This one is more tricky and that's why gpf.loaded() has been created
         */
        (function () {
            var
                sources,
                idx = 0,
                loadSources = function () {
                    var src;
                    if (idx < sources.length) {
                        src = sources[idx] + ".js";
                        if ("undefined" !== typeof gpfSourcesPath) {
                            src = gpfSourcesPath + src;
                        }
                        gpf.http.include(src)
                            .onLoad(loadSources);
                        ++idx;
                    } else {
                        _finishLoading();
                    }
                },
                // Ugly but fast way to insert sources
                head = document.getElementsByTagName("head")[0]
                || document.documentElement,

                include = function (src) {
                    if ("undefined" !== typeof gpfSourcesPath) {
                        src = gpfSourcesPath + src;
                    }
                    var script = document.createElement("script");
                    script.language = "javascript";
                    script.src = src;
                    head.insertBefore(script, head.firstChild);
                },
                // Sequence of things to load (followed by test)
                bootList = ["sources", "sources",
                    "base", "each",
                    "events", "events",
                    "http", "http"],
                boot = function () {
                    if (0 === idx % 2) {
                        include(bootList[idx] + ".js");
                        ++idx;
                    } else {
                        if (undefined !== gpf[bootList[idx]]) {
                            ++idx;
                        }
                    }
                    if (idx === bootList.length) {
                        /*
                         * Now that include & sources are loaded,
                         * load the missing sources
                         */
                        sources = gpf.sources().split(",");
                        idx = gpf.test(sources, "http") + 1;
                        loadSources();
                    } else {
                        window.setTimeout(boot, 100);
                    }
                };
            boot();
        }());
    }

/*#endif*/

}()); /* End of privacy scope */
