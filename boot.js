/*#ifndef(UMD)*/
"use strict";
/*#endif*/

/*jshint browser: true*/
/*jshint node: true*/
/*jshint wsh: true*/

/*
 * Detect host & define global context
 */
var
    /**
     * GPF version
     *
     * @type {string}
     * @private
     */
    _gpfVersion = "0.1",

    /**
     * Host type
     * <ul>
     *     <li>wscript: Microsoft cscript / wscript</li>
     *     <li>phantomjs: PhantomJS</li>
     *     <li>nodejs: NodeJS</li>
     *     <li>browser: Browser</li>
     *     <li>unknown: Unknown</li>
     * </ul>
     *
     * @type {string}
     * @private
     */
    _gpfHost,

    /**
     * Main context object
     *
     * @type {Object}
     * @private
     */
    _gpfContext,

    /**
     * The current host is a nodeJS like
     *
     * @type {boolean}
     * @private
     */
    _gpfInNode = false,

    /**
     * The current host is a browser like
     *
     * @type {boolean}
     * @private
     */
    _gpfInBrowser = false;

/*#ifdef(DEBUG)*/

_gpfVersion += "d";

/*#endif*/

// Microsoft cscript / wscript
if ("undefined" !== typeof WScript) {
    _gpfHost = "wscript";
    _gpfContext = (function () {return this;}).apply(null, []);

    // Define console APIs
    _gpfContext.console = {
        log: function (t) {WScript.Echo("    " + t);},
        info: function (t) {WScript.Echo("[?] " + t);},
        warn: function (t) {WScript.Echo("/!\\ " + t);},
        error: function (t) {WScript.Echo("(X) " + t);}
    };

// PhantomJS
/*global phantom:true*/
} else if ("undefined" !== typeof phantom && phantom.version) {
    _gpfHost = "phantomjs";
    _gpfContext = window;
    _gpfInNode = true;
    _gpfInBrowser = true;

// Nodejs
/*global module:true*/
} else if ("undefined" !== typeof module && module.exports) {
    _gpfHost = "nodejs";
    _gpfContext = global;
    _gpfInNode = true;

// Browser
} else if ("undefined" !== typeof window) {
    _gpfHost = "browser";
    _gpfContext = window;
    _gpfInBrowser = true;

// Default: unknown
/*jshint -W040*/
} else {
    _gpfHost = "unknown";
    _gpfContext = this;

}
/*jshint +W040*/

/*#ifndef(UMD)*/

_gpfContext.gpf = {};

/*#endif*/

// Install host specific namespace (if any)
if (_gpfInNode) {
    gpf.node = {};
}

/**
 * Returns the current version
 *
 * @return {string}
 */
gpf.version = function () {
    return _gpfVersion;
};

/**
 * Returns a string identifying the detected host
 *
 * @return {String}
 * <ul>
 *      <li>"wscript" for cscript and wscript</li>
 *      <li>"nodejs" for nodejs</li>
 *      <li>"phantomjs" for phantomjs</li>
 *      <li>"browser" for any browser</li>
 *      <li>"unknown" if not detected</li>
 * </ul>
 */
gpf.host = function () {
    return _gpfHost;
};

/**
 * Resolve the provided evaluation path and returns the result
 *
 * @param {String|string[]} [path=undefined] path Dot separated list of
 * identifiers (or identifier array)
 * @return {*|undefined}
 * - when path is empty, it returns the current host higher object
 * - when path is "gpf" it returns the GPF object
 */
gpf.context = function (path) {
    var
        len,
        idx,
        result;
    if (undefined === path) {
        return _gpfContext;
    } else {
        if ("string" === typeof path) {
            path = path.split(".");
        }
        len = path.length;
        idx = 0;
        if (path[0] === "gpf") {
            result = gpf;
            ++idx;
        } else {
            result = _gpfContext;
        }
        for (; idx < len; ++idx) {
            result = result[path[idx]];
            if (undefined === result) {
                break;
            }
        }
        return result;
    }
};

/*#ifndef(UMD)*/

var
    /**
     * Set to true once all sources of GPF are loaded
     *
     * @type {boolean}
     * @private
     */
    _gpfLoaded = false,

    /**
     * List of functions to call on load
     *
     * @type {Function[]}
     * @private
     */
    _gpfLoadCallbacks = [],

    /**
     * Callback used once all sources are loaded, invoke the callbacks
     *
     * @private
     */
    _gpfFinishLoading = function () {
        _gpfLoaded = true;
        while (_gpfLoadCallbacks.length) {
            _gpfLoadCallbacks.shift()();
        }
    };

/**
 * Test if GPF is loaded
 *
 * @param {Function} [callback=undefined] callback This callback is invoked when
 * GPF is loaded (may be immediately if already loaded)
 * @return {boolean} True if GPF is fully loaded, false otherwise
 */
gpf.loaded = function (callback) {
    if (callback) {
        if (_gpfLoaded) {
            callback();
        } else {
            _gpfLoadCallbacks.push(callback);
        }
    }
    return _gpfLoaded;
};

if(!gpf.loaded) {

/*#else*/

    gpf.loaded = function (callback) {
        if (callback) {
            callback();
        }
        return true;
    };

/*#endif*/

/*#ifndef(UMD)*/

}

/*#endif*/

/*
 * Handling external options
 * TODO: provide ways to turn on/off features by adding options
 */

/*#ifdef(DEBUG)*/

// DEBUG specifics

/**
 * Assertion helper
 *
 * @param {Boolean} condition May be a truthy value
 * @param {String} message Assertion message (to explain the violation if it
 * fails)
 */
gpf.ASSERT = function (condition, message) {
    if (undefined === message) {
        message = "gpf.ASSERT with no message";
        condition = false;
    }
    if (!condition) {
        console.warn("ASSERTION FAILED: " + message);
        throw gpf.Error.AssertionFailed({
            message: message
        });
    }
};

if (!gpf.ASSERT) {

/*#else*/

    gpf.ASSERT = function /*gpf:ignore*/ () {};

/*#endif*/

/*#ifdef(DEBUG)*/

}

/*#endif*/

/*#ifndef(UMD)*/

/*
 * Loading sources occurs here because the release version will have
 * everything embedded.
 */
if ("wscript" === _gpfHost) {
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
        _gpfFinishLoading();
    }());

} else if (_gpfInNode) {
    /*
     * This is probably the simplest part: use require
     */
    require("./sources.js");
    (function () {
        var
            sources = gpf.sources().split(","),
            idx,
            fs = require("fs");
        for (idx = 0; idx < sources.length; ++idx) {
            /*jslint evil: true*/
            /**
             * require create private scopes.
             * I changed my mind and remove the IIFE structure around sources
             * so that I can share 'internal' variables.
             * That's why I need to load the source and evaluate it here
             */
            eval(fs.readFileSync(__dirname
                + "/" + sources[idx] + ".js").toString());
            /*jslint evil: false*/
        }
        _gpfFinishLoading();
    }());

} else { // "browser" === _gpfHost
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
                    gpf.http.include(src, {
                        load: loadSources
                    });
                    ++idx;
                } else {
                    _gpfFinishLoading();
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
                "compatibility", "setReadOnlyProperty",
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
                    /**
                     * Use an aggressive setting but will be used only for
                     * the source version
                     */
                    window.setTimeout(boot, 0);
                }
            };
        boot();
    }());
}

/*#endif*/