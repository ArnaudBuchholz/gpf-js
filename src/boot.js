/*#ifndef(UMD)*/
"use strict";
/*exported _GPF_HOST_BROWSER*/ // gpf.HOST_BROWSER
/*exported _GPF_HOST_NODEJS*/ // gpf.HOST_NODEJS
/*exported _GPF_HOST_PHANTOMJS*/ // gpf.HOST_PHANTOMJS
/*exported _GPF_HOST_RHINO*/ // gpf.HOST_RHINO
/*exported _GPF_HOST_UNKNOWN*/ // gpf.HOST_UNKNOWN
/*exported _GPF_HOST_WSCRIPT*/ // gpf.HOST_WSCRIPT
/*exported _gpfCompatibility*/ // Polyfills for missing 'standard' methods
/*exported _gpfContext*/ // Resolve contextual string
/*exported _gpfDosPath*/ // DOS-like path
/*exported _gpfEmptyFunc*/ // An empty function
/*exported _gpfExit*/ // Exit function
/*exported _gpfGenericFactory*/ // Create any class by passing the right number of parameters
/*exported _gpfHost*/ // Host type
/*exported _gpfIgnore*/ // Helper to remove unused parameter warning
/*exported _gpfInBrowser*/ // The current host is a browser like
/*exported _gpfInNode*/ // The current host is a nodeJS like
/*exported _gpfMainContext*/ // Main context object
/*exported _gpfMsFSO*/ // Scripting.FileSystemObject activeX
/*exported _gpfNodeFs*/ // Node require("fs")
/*exported _gpfNodePath*/ // Node require("path")
/*exported _gpfResolveScope*/ // Translate the parameter into a valid scope
/*exported _gpfVersion*/ // GPF version
/*exported _gpfWebDocument*/ // Browser document object
/*exported _gpfWebHead*/ // Browser head tag
/*exported _gpfWebWindow*/ // Browser window object
/*eslint-disable no-unused-vars*/
/*#endif*/

 /*eslint-disable no-invalid-this, no-useless-call*/ // this is used to grab the global context

// An empty function
function _gpfEmptyFunc () {}

var
    // GPF version
    _gpfVersion = "0.1.5-alpha",

    // Host type constants
    _GPF_HOST_BROWSER               = "browser",
    /*jshint browser: true*/
    /*eslint-env browser*/

    _GPF_HOST_NODEJS                = "nodejs",
    /*jshint node: true*/
    /*eslint-env node*/

    _GPF_HOST_PHANTOMJS             = "phantomjs",
    /*jshint phantom: true*/
    /*eslint-env phantomjs*/

    _GPF_HOST_RHINO                 = "rhino",
    /*jshint rhino: true*/
    /*eslint-env rhino*/

    _GPF_HOST_UNKNOWN               = "unknown",

    _GPF_HOST_WSCRIPT               = "wscript",
    /*jshint wsh: true*/
    /*eslint-env wsh*/

    // Host type, see _GPF_HOST_xxx
    _gpfHost = _GPF_HOST_UNKNOWN,

    // Indicates that paths are DOS-like (i.e. case insensitive with /)
    _gpfDosPath = false,

    /*jshint -W040*/ // This is the common way to get the global context
    // Main context object
    _gpfMainContext = this, //eslint-disable-line consistent-this
    /*jshint +W040*/

    /**
     * Helper to ignore unused parameter
     *
     * @param {*} param
     */
    /*gpf:nop*/ _gpfIgnore = _gpfEmptyFunc,

    /**
     * Exit function
     *
     * @param {Number} code
     */
    _gpfExit = _gpfEmptyFunc,

    // The current host is a nodeJS like
    _gpfInNode = false,

    // The current host is a browser like
    _gpfInBrowser = false,

    /**
     * Browser window object
     *
     * @type {Object}
     */
    _gpfWebWindow,

    /**
     * Browser document object
     *
     * @type {Object}
     */
    _gpfWebDocument,

    /**
     * Browser head tag
     *
     * @type {Object}
     */
    _gpfWebHead,

    /**
     * Scripting.FileSystemObject activeX
     *
     * @type {Object}
     */
    _gpfMsFSO,

    /**
     * Node require("fs")
     *
     * @type {Object}
     */
    _gpfNodeFs,

    /**
     * Node require("path")
     *
     * @type {Object}
     */
    _gpfNodePath,

    /**
     * Polyfills for missing 'standard' methods
     *
     * @type {Object}
     */
    _gpfCompatibility = {};

/**
 * Translate the parameter into a valid scope
 *
 * @param {*} scope
 */
function _gpfResolveScope (scope) {
    if (null === scope || "object" !== typeof scope) {
        return _gpfMainContext;
    }
    return scope;
}

/*#ifdef(DEBUG)*/

_gpfVersion += "-debug";

/*#endif*/

/*#ifndef(UMD)*/

var
    /**
     * Asynchronous load function
     *
     * @param {String} srcFileName
     * @param {Function} callback
     * - {String} [content=undefined] content if provided, the content is concatenated to be evaluated in the end.
     * If not provided, it is assumed that the source was evaluated in the global context
     */
    _gpfAsyncLoadForBoot,
    /**
     * Synchronous read function
     *
     * @param {String} srcFileName
     * @return {String} content of the srcFileName
     */
    _gpfSyncReadForBoot;

/*#endif*/

function _getObjectProperty (parent, name) {
    /* istanbul ignore else */
    if (undefined !== parent) {
        return parent[name];
    }
}

function _getOrCreateObjectProperty (parent, name) {
    var result = parent[name];
    if (undefined === result) {
        result = parent[name] = {};
    }
    return result;
}

/**
 * Resolve the provided contextual path and returns the result
 *
 * @param {String[]} path array of identifiers
 * @param {Boolean} [createMissingParts=false] createMissingParts if the path leads to undefined parts and
 * createMissingParts is true, it allocates a default empty object
 *
 * @return {*|undefined}
 * - when path is undefined, it returns the current host higher object
 * - when path is "gpf" it returns the GPF object
 */
function _gpfContext (path, createMissingParts) {
    var reducer,
        rootContext;
    if (createMissingParts) {
        reducer = _getOrCreateObjectProperty;
    } else {
        reducer = _getObjectProperty;
    }
    if (path[0] === "gpf") {
        rootContext = gpf;
        path = path.slice(1);
    } else {
        rootContext = _gpfMainContext;
    }
    return path.reduce(reducer, rootContext);
}

/**
 * Create any class by passing the right number of parameters
 *
 * @this {Function} constructor to invoke
 */
var _gpfGenericFactory = (function () {
    // Generate the constructor call forwarder function
    var src = [
            "var C = this,",
            "    p = arguments,",
            "    l = p.length;"
        ],
        args = [],
        idx,
        Func = Function;
    for (idx = 0; idx < 10; ++idx) {
        args.push("p[" + idx + "]");
    }
    for (idx = 0; idx < 10; ++idx) {
        src.push("    if (" + idx + " === l) {");
        src.push("        return new C(" + args.slice(0, idx).join(", ") + ");");
        src.push("    }");
    }
    return new Func(src.join("\r\n"));
}());

/* Host detection */
/* istanbul ignore next */

// Microsoft cscript / wscript
if ("undefined" !== typeof WScript) {
    /*eslint-disable new-cap*/

    _gpfHost = _GPF_HOST_WSCRIPT;
    _gpfDosPath = true;
    _gpfMainContext = function () {
        return this;
    }.call(null);
    _gpfExit = function (code) {
        WScript.Quit(code);
    };

    // Define console APIs
    _gpfMainContext.console = {
        log: function (t) {
            WScript.Echo("    " + t);
        },
        info: function (t) {
            WScript.Echo("[?] " + t);
        },
        warn: function (t) {
            WScript.Echo("/!\\ " + t);
        },
        error: function (t) {
            WScript.Echo("(X) " + t);
        }
    };

/*#ifndef(UMD)*/

    _gpfMsFSO = new ActiveXObject("Scripting.FileSystemObject");

    _gpfSyncReadForBoot = function (srcFileName) {
        var srcFile = _gpfMsFSO.OpenTextFile(srcFileName),
            srcContent = srcFile.ReadAll();
        srcFile.Close();
        return srcContent;
    };

/*#endif*/

    /*eslint-enable new-cap*/
} else if ("undefined" !== typeof print && "undefined" !== typeof java) {
    _gpfHost = _GPF_HOST_RHINO;
    _gpfDosPath = false;
    _gpfMainContext = function () {
        return this;
    }.call(null);
    _gpfExit = function (code) {
        java.lang.System.exit(code);
    };

    // Define console APIs
    _gpfMainContext.console = {
        log: function (t) {
            print("    " + t);
        },
        info: function (t) {
            print("[?] " + t);
        },
        warn: function (t) {
            print("/!\\ " + t);
        },
        error: function (t) {
            print("(X) " + t);
        }
    };

/*#ifndef(UMD)*/

    _gpfSyncReadForBoot = readFile;

/*#endif*/

// PhantomJS
} else if ("undefined" !== typeof phantom && phantom.version) {
    _gpfHost = _GPF_HOST_PHANTOMJS;
    _gpfDosPath = require("fs").separator === "\\";
    _gpfMainContext = window;
    _gpfInNode = true;
    _gpfInBrowser = true;
    _gpfExit = phantom.exit;

/*#ifndef(UMD)*/

    _gpfNodeFs =  require("fs");

    _gpfSyncReadForBoot = function (srcFileName) {
        return _gpfNodeFs.read(srcFileName);
    };

/*#endif*/

// Nodejs
} else if ("undefined" !== typeof module && module.exports) {
    _gpfHost = _GPF_HOST_NODEJS;
    _gpfNodePath = require("path");
    _gpfDosPath = _gpfNodePath.sep === "\\";
    _gpfMainContext = global;
    _gpfInNode = true;
    _gpfExit = process.exit;

/*#ifndef(UMD)*/

    /*eslint-disable no-sync*/ // Simpler this way

    _gpfNodeFs =  require("fs");

    _gpfSyncReadForBoot = function (srcFileName) {
        return _gpfNodeFs.readFileSync(srcFileName).toString();
    };

/*#endif*/

// Browser
} else if ("undefined" !== typeof window) {
    _gpfHost = _GPF_HOST_BROWSER;
    _gpfMainContext = window;
    _gpfInBrowser = true;
    _gpfExit = _gpfEmptyFunc;
    _gpfWebWindow = window;
    _gpfWebDocument = document;
    _gpfWebHead = _gpfWebDocument.getElementsByTagName("head")[0] || _gpfWebDocument.documentElement;

/*#ifndef(UMD)*/

    _gpfAsyncLoadForBoot = function (srcFileName, callback) {
        if (gpf.web.include) {
            gpf.web.include(srcFileName, function (event) {
                if (gpf.events.EVENT_ERROR === event.type) {
                    console.error(event.get("error").message);
                } else {
                    callback();
                }
            });
            return;
        }
        var script = _gpfWebDocument.createElement("script");
        script.language = "javascript";
        script.src = srcFileName;
        script = _gpfWebHead.insertBefore(script, _gpfWebHead.firstChild);
        var source = srcFileName.split("/").pop().split(".")[0],
            test = {
                "sources":          "gpf.sources",
                "assert":           "gpf.assert",
                "noconflict":       "gpf.noConflict",
                "array":            "_gpfCompatibility.Array",
                "date":             "_gpfCompatibility.Date",
                "function":         "_gpfCompatibility.Function",
                "object":           "_gpfCompatibility.Object",
                "string":           "_gpfCompatibility.String",
                "promise":          "gpf.Promise",
                "compatibility":    "gpf.internals._gpfCompatibility",
                "constants":        "gpf.HOST_UNKNOWN",
                "events":           "gpf.events",
                "include":          "gpf.web.include"
            }[source].split(".");
        function wait () {
            if (undefined === _gpfContext(test)) {
                // Use an aggressive setting as it will be used only for the non UMD version
                setTimeout(wait, 0);
            } else {
                _gpfWebHead.removeChild(script);
                callback();
            }
        }
        wait();
    };

/*#endif*/

}

/*#ifndef(UMD)*/

_gpfMainContext.gpf = {
    internals: {} // To support testable internals
};

/*#endif*/

// Install host specifics (if any)
/* istanbul ignore else */ // Because tested with NodeJS
if (_gpfInNode) {
    gpf.node = {};
}
// Some web-related tools will be configured even if not in a browser, declare the namespace now
gpf.web = {};

// Returns the current version
gpf.version = function () {
    return _gpfVersion;
};

/**
 * Returns a string identifying the detected host
 *
 * @return {String}
 * - gpf.HOST_WSCRIPT for cscript and wscript
 * - gpf.HOST_NODEJS for nodejs
 * - gpf.HOST_PHANTOMJS for phantomjs
 * - gpf.HOST_BROWSER for any browser
 * - gpf.HOST_UNKNOWN if not detected
 */
gpf.host = function () {
    return _gpfHost;
};

/**
 * Resolve the provided contextual path and returns the result
 *
 * @param {String} path Dot separated list of identifiers
 *
 * @return {*|undefined}
 * - when path is undefined, it returns the current host higher object
 * - when path is "gpf" it returns the GPF object
 */
gpf.context = function (path) {
    if (undefined === path) {
        return _gpfMainContext;
    }
    return _gpfContext(path.split("."));
};

/*#ifndef(UMD)*/

var
    // Set to true once all sources of GPF are loaded
    _gpfLoaded = false,

    /**
     * List of functions to call on load
     *
     * @type {Function[]}
     */
    _gpfLoadCallbacks = [];

// Callback used once all sources are loaded, invoke the callbacks
function _gpfFinishLoading () {
    _gpfLoaded = true;
    while (_gpfLoadCallbacks.length) {
        /* istanbul ignore next */ // Not used within NodeJS (mostly browser only)
        _gpfLoadCallbacks.shift()();
    }
}

/* istanbul ignore next */ // Not used within NodeJS (mostly browser only)
/**
 * Test if GPF is loaded
 *
 * @param {Function} [callback=undefined] callback This callback is invoked when GPF is loaded (may be immediately if
 * already loaded)
 * @return {Boolean} True if GPF is fully loaded, false otherwise
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

/* istanbul ignore if */ // Because tested in DEBUG
if (!gpf.loaded) {

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

/*#ifndef(UMD)*/

/**
 * Loading sources occurs here for the non UMD version.
 * UMD versions (debug / release) will have everything concatenated.
 */


/* istanbul ignore next */ // Handled the right way with NodeJS
// gpfSourcesPath - if defined - gives the relative path to sources
if ("undefined" === typeof gpfSourcesPath) {
    _gpfMainContext.gpfSourcesPath = "";
} else {
    var pathSep;
    if (_gpfDosPath) {
        pathSep = "\\";
    } else {
        pathSep = "/";
    }
    if (gpfSourcesPath.charAt(gpfSourcesPath.length - 1) !== pathSep) {
        gpfSourcesPath += pathSep;
    }
}

/* istanbul ignore else */ // Should not happen
if (_gpfSyncReadForBoot) {
    _gpfAsyncLoadForBoot = function (name, callback) {
        callback(_gpfSyncReadForBoot(name));
    };
} else if (undefined === _gpfAsyncLoadForBoot) {
    throw new Error("A method must be defined to load sources");
}

_gpfAsyncLoadForBoot(gpfSourcesPath + "sources.js", function (sourcesContent) {
    /* istanbul ignore else */ // Only browser loads content immediately
    if (sourcesContent) {
        /*jslint evil: true*/
        eval(sourcesContent); //eslint-disable-line no-eval
        /*jslint evil: false*/
    }
    var sources = gpf.sources(),
        allContent = [],
        idx = 0;

    function next (content) {
        /* istanbul ignore else */ // Only browser loads content immediately
        if (content) {
            allContent.push(content);
        }
        var src = sources[idx++];
        if (src) {
            _gpfAsyncLoadForBoot(gpfSourcesPath + src + ".js", next);
        } else {
            /* istanbul ignore else */ // Only browser loads content immediately
            if (allContent.length) {
                /*jslint evil: true*/
                eval(allContent.join("\r\n")); //eslint-disable-line no-eval
                /*jslint evil: false*/
            }
            _gpfFinishLoading();
        }
    }

    next();
});

/*#endif*/
