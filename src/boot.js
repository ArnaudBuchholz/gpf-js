/*#ifndef(UMD)*/
"use strict";
/*global gpfSourcesPath*/ // Global source path
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
    _gpfInBrowser = false,

    /**
     * Browser window object
     *
     * @type {Object}
     * @private
     */
    _gpfWebWindow,

    /**
     * Browser document object
     *
     * @type {Object}
     * @private
     */
     _gpfWebDocument,

    /**
     * Browser head tag
     *
     * @type {Object}
     * @private
     */
    _gpfWebHead,

    /**
     * Scripting.FileSystemObject activeX
     *
     * @type {Object}
     * @private
     */
    _gpfMsFSO,

    /**
     * Node FS module
     *
     * @type {Object}
     * @private
     */
    _gpfNodeFS;

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

// Install host specifics (if any)
if (_gpfInNode) {
    gpf.node = {};
}
if (_gpfInBrowser) {
    _gpfWebWindow = window;
    _gpfWebDocument = document;
    _gpfWebHead = _gpfWebDocument.getElementsByTagName("head")[0]
                  || _gpfWebDocument.documentElement;
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
    /*exported _gpfFinishLoading*/ // Will be used by the boot specifics

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

/**
 * Loading sources occurs here for the non UMD version.
 * UMD versions (debug / release) will have everything concatenated.
 */

// gpfSourcesPath - if defined - gives the relative path to sources
if ("undefined" === typeof gpfSourcesPath) {
    _gpfContext.gpfSourcesPath = "";
}

if ("wscript" === _gpfHost) {
    _gpfMsFSO = new ActiveXObject("Scripting.FileSystemObject");
    (function () {
        var src = "boot_ms.js",
            srcFile,
            srcContent;
        if ("undefined" !== typeof gpfSourcesPath) {
            src = gpfSourcesPath + src;
        }
        srcFile = _gpfMsFSO.OpenTextFile(src);
        srcContent = srcFile.ReadAll();
        srcFile.Close();
        /*jslint evil: true*/
        eval(srcContent);
        /*jslint evil: false*/
    }());

} else if (_gpfInNode) {
    _gpfNodeFS =  require("fs");
    /*global require*/
    require("./boot_node.js");

} else { // "browser" === _gpfHost
    var _gpfRawHttpInclude = function (src) {
        var script = _gpfWebDocument.createElement("script");
        script.language = "javascript";
        script.src = gpfSourcesPath + src;
        _gpfWebHead.insertBefore(script, _gpfWebHead.firstChild);
    };
    _gpfRawHttpInclude("boot_web.js");

}

/*#endif*/