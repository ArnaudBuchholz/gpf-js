/*#ifndef(UMD)*/
"use strict";
/*global gpfSourcesPath:true*/ // Global source path
/*exported _gpfContext*/
/*exported _gpfDosPath*/
/*exported _gpfEmptyFunc*/
/*exported _gpfExit*/
/*exported _gpfHost*/
/*exported _gpfInBrowser*/
/*exported _gpfInNode*/
/*exported _gpfMsFSO*/
/*exported _gpfNodeFs*/
/*exported _gpfNodePath*/
/*exported _gpfResolveScope*/
/*exported _gpfVersion*/
/*exported _gpfWebDocument*/
/*exported _gpfWebHead*/
/*exported _gpfWebWindow*/
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
     *
     * - wscript: Microsoft cscript / wscript
     * - phantomjs: PhantomJS
     * - nodejs: NodeJS
     * - browser: Browser
     * - unknown: Unknown
     *
     * @type {String}
     * @private
     */
    _gpfHost,

    /**
     * Indicates that paths are DOS-like (i.e. case insensitive with /)
     *
     * @type {Boolean}
     * @private
     */
    _gpfDosPath = false,

    /**
     * Main context object
     *
     * @type {Object}
     * @private
     */
    _gpfContext,

    /**
     * To implement gpf.noConflict(), we need to keep the previous content of
     * gpf.
     * Makes sense only for the following hosts:
     * - phantomjs
     * - browser
     * - unknown
     *
     * @type {Object}
     * @private
     */
    _gpfConflictingSymbol,

    /**
     * Exit function
     *
     * @param {Number} code
     * @private
     */
    _gpfExit,

    /*exported _gpfResolveScope*/
    /**
     * Translate the parameter into a valid scope
     *
     * @param {*} scope
     * @private
     */
    _gpfResolveScope = function (scope) {
        if (null === scope // || undefined === scope
            || "object" !== typeof scope)  {
            return _gpfContext;
        }
        return scope;
    },

    /**
     * The current host is a nodeJS like
     *
     * @type {Boolean}
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
     * Node require("fs")
     *
     * @type {Object}
     * @private
     */
    _gpfNodeFs,

    /**
     * Node require("path")
     *
     * @type {Object}
     * @private
     */
    _gpfNodePath,

    /**
     * An empty function
     *
     * @private
     */
    _gpfEmptyFunc = function () {};

/*#ifdef(DEBUG)*/

_gpfVersion += "d";

/*#endif*/

// Microsoft cscript / wscript
if ("undefined" !== typeof WScript) {
    _gpfHost = "wscript";
    _gpfDosPath = true;
    _gpfContext = (function () {return this;}).apply(null, []);
    _gpfExit = function (code) {
        WScript.Quit(code);
    };

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
    _gpfDosPath = require("fs").separator === "\\";
    _gpfContext = window;
    _gpfInNode = true;
    _gpfInBrowser = true;
    _gpfExit = phantom.exit;

// Nodejs
/*global module:true*/
} else if ("undefined" !== typeof module && module.exports) {
    _gpfHost = "nodejs";
    _gpfNodePath = require("path");
    _gpfDosPath = _gpfNodePath.sep === "\\";
    _gpfContext = global;
    _gpfInNode = true;
    _gpfExit = process.exit;

// Browser
} else if ("undefined" !== typeof window) {
    _gpfHost = "browser";
    _gpfContext = window;
    _gpfInBrowser = true;
    _gpfExit = _gpfEmptyFunc;

// Default: unknown
/*jshint -W040*/
} else {
    _gpfHost = "unknown";
    _gpfContext = this;
    _gpfExit = _gpfEmptyFunc;

}
/*jshint +W040*/


/*#ifndef(UMD)*/

_gpfContext.gpf = {};

/*#else*/

if (_gpfContext.gpf) {
    _gpfConflictingSymbol = _gpfContext.gpf;
}

/**
 * Relinquish control of the gpf variable.
 *
 * @returns {Object} current GPF instance
 */
gpf.noConflict = function () {
    if (undefined !== _gpfConflictingSymbol) {
        _gpfContext.gpf = _gpfConflictingSymbol;
    } else {
        delete _gpfContext.gpf;
    }
    return gpf;
};

/*#endif*/

// Install host specifics (if any)
if (_gpfInNode) {
    gpf.node = {};
}
// Some web-related tools will be configured even if not in a browser
gpf.web = {};
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
 *      <li>"wscript" for cscript and wscript
 *      <li>"nodejs" for nodejs
 *      <li>"phantomjs" for phantomjs
 *      <li>"browser" for any browser
 *      <li>"unknown" if not detected
 * </ul>
 */
gpf.host = function () {
    return _gpfHost;
};

/**
 * Get parent member named name. If missing and the constructor is specified,
 * it is allocated.
 *
 * @param {Object} parent
 * @param {String} name
 * @param {Boolean} createMissingParts
 * @return {Object|undefined}
 * @private
 */
function _getOrCreateChild(parent, name, createMissingParts) {
    var
        result = parent[name];
    if (undefined === result && createMissingParts) {
        result = parent[name] = {};
    }
    return result;
}

/**
 * Resolve the provided evaluation path and returns the result
 *
 * @param {String|string[]} [path=undefined] path Dot separated list of
 * identifiers (or identifier array)
 * @param {Boolean} [createMissingParts=false] createMissingParts if the path
 * leads to undefined parts and createMissingParts is true, it allocates it
 *
 * @return {*|undefined}
 * - when path is empty, it returns the current host higher object
 * - when path is "gpf" it returns the GPF object
 */
gpf.context = function (path, createMissingParts) {
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
        for (; result && idx < len; ++idx) {
            result = _getOrCreateChild(result, path[idx],
                true === createMissingParts);
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
} else {
    var pathSep;
    if (_gpfDosPath) {
        pathSep = "\\";
    } else {
        pathSep = "/";
    }
    if (gpfSourcesPath.charAt(gpfSourcesPath.length - 1) !== pathSep) {
        gpfSourcesPath = gpfSourcesPath + pathSep;
    }
}

if ("wscript" === _gpfHost) {
    _gpfMsFSO = new ActiveXObject("Scripting.FileSystemObject");
    (function () {
        var srcFile,
            srcContent;
        srcFile = _gpfMsFSO.OpenTextFile(gpfSourcesPath + "boot_ms.js");
        srcContent = srcFile.ReadAll();
        srcFile.Close();
        /*jslint evil: true*/
        eval(srcContent);
        /*jslint evil: false*/
    }());

} else if (_gpfInNode) {
    _gpfNodeFs =  require("fs");

    /**
     * Phantom/Node File System read text file method (boot)
     * @type {Function}
     */
    var _gpfFSRead;
    if ("phantomjs" === _gpfHost) {
        _gpfFSRead = _gpfNodeFs.read;
    } else {
        _gpfFSRead = function (path) {
            return _gpfNodeFs.readFileSync(path).toString();
        };
    }
    /*jslint evil: true*/
    eval(_gpfFSRead(gpfSourcesPath + "boot_node.js"));
    /*jslint evil: false*/

} else { // "browser" === _gpfHost
    var _gpfWebRawInclude = function (src) {
        var script = _gpfWebDocument.createElement("script");
        script.language = "javascript";
        script.src = gpfSourcesPath + src;
        _gpfWebHead.insertBefore(script, _gpfWebHead.firstChild);
    };
    _gpfWebRawInclude("boot_web.js");

}

/*#endif*/