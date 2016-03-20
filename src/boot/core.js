/*#ifndef(UMD)*/
"use strict";
/*exported _GPF_HOST_BROWSER*/ // gpf.HOST_BROWSER
/*exported _GPF_HOST_NODEJS*/ // gpf.HOST_NODEJS
/*exported _GPF_HOST_PHANTOMJS*/ // gpf.HOST_PHANTOMJS
/*exported _GPF_HOST_RHINO*/ // gpf.HOST_RHINO
/*exported _GPF_HOST_UNKNOWN*/ // gpf.HOST_UNKNOWN
/*exported _GPF_HOST_WSCRIPT*/ // gpf.HOST_WSCRIPT
/*exported _gpfAssert*/ // Assertion method
/*exported _gpfAsserts*/ // Multiple assertion method
/*exported _gpfCompatibility*/ // Polyfills for missing 'standard' methods
/*exported _gpfContext*/ // Resolve contextual string
/*exported _gpfDosPath*/ // DOS-like path
/*exported _gpfEmptyFunc*/ // An empty function
/*exported _gpfExit*/ // Exit function
/*exported _gpfGenericFactory*/ // Create any class by passing the right number of parameters
/*exported _gpfGetBootstrapMethod*/ // Create a method that contains a bootstrap (called only once)
/*exported _gpfHost*/ // Host type
/*exported _gpfIgnore*/ // Helper to remove unused parameter warning
/*exported _gpfInBrowser*/ // The current host is a browser like
/*exported _gpfInNode*/ // The current host is a nodeJS like
/*global _gpfMainContext*/ // Main context object
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

// An empty function
function _gpfEmptyFunc () {}

var
    /**
     * To implement gpf.noConflict(), we need to keep the previous content of gpf.
     * Makes sense only for the following hosts:
     * - phantomjs
     * - browser
     * - unknown
     *
     * @type {undefined|Object}
     */
    _gpfConflictingSymbol,

    /**
     * Helper to ignore unused parameter
     *
     * @param {*} param
     */
    /*gpf:nop*/ _gpfIgnore = _gpfEmptyFunc,

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

if (undefined === _gpfMainContext) {
    /*jshint -W040*/ // This is the common way to get the global context
    // Main context object
    _gpfMainContext = (function () {
        return this; //eslint-disable-line no-invalid-this
    }());
    /*jshint +W040*/
}

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
 * Create a method that contains a bootstrap (called only once)
 *
 * @param {String} path method path
 * @param {Function} methodFactory Must return a function (it receives the path as parameter)
 * @return {function}
 * @closure
 */
function _gpfGetBootstrapMethod (path, methodFactory) {
    path = path.split(".");
    var name = path.pop(),
        namespace = _gpfContext(path, true),
        mustBootstrap = true,
        method;
    // The initial method is protected as the caller may keep its reference
    namespace[name] = function () {
        /* istanbul ignore else */ // Because that's the idea (shouldn't be called twice)
        if (mustBootstrap) {
            method = methodFactory(path);
            namespace[name] = method;
            mustBootstrap = false;
        }
        return method.apply(this, arguments);
    };
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

/*#ifndef(UMD)*/

_gpfMainContext.gpf = {
    internals: {} // To support testable internals
};

/*#else*/

_gpfConflictingSymbol = _gpfMainContext.gpf;

/* istanbul ignore next */ // web only
/**
 * Relinquish control of the gpf variable.
 *
 * @return {Object} current GPF instance
 */
gpf.noConflict = function () {
    if (undefined === _gpfConflictingSymbol) {
        delete _gpfMainContext.gpf;
    } else {
        _gpfMainContext.gpf = _gpfConflictingSymbol;
    }
    return gpf;
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
