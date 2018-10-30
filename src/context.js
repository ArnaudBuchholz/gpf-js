/**
 * @file Context management
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfMainContext*/ // Main context object
/*exported _gpfContext*/ // Resolve contextual string
/*#endif*/

function _gpfGetObjectProperty (parent, name) {
    if (undefined !== parent) {
        return parent[name];
    }
}

function _gpfGetOrCreateObjectProperty (parent, name) {
    var result = parent[name];
    if (undefined === result) {
        result = parent[name] = {};
    }
    return result;
}

// Apply reducer on path
function _gpfReduceContext (path, reducer) {
    var rootContext,
        pathToReduce;
    if (path[0] === "gpf") {
        rootContext = gpf;
        pathToReduce = path.slice(1);
    } else {
        rootContext = _gpfMainContext;
        pathToReduce = path;
    }
    return pathToReduce.reduce(reducer, rootContext);
}

/**
 * Result of {@link gpf.context} call, depends on the specified path
 * - when not specified, it returns the current host main context object
 * - when `"gpf"`, it **always** returns the GPF object
 * - when it leads to nothing, `undefined` is returned

 * @typedef {*} gpf.typedef.contextResult
 * @since 0.1.5
 */

/**
 * Resolve the provided contextual path and returns the result
 *
 * @param {String[]} path Array of identifiers
 * @param {Boolean} [createMissingParts=false] If the path includes undefined parts and createMissingParts is true,
 * it allocates a default empty object. This allows building namespaces on the fly.
 *
 * @return {gpf.typedef.contextResult} Resolved path
 * @since 0.1.5
 */
function _gpfContext (path, createMissingParts) {
    var reducer;
    if (createMissingParts) {
        reducer = _gpfGetOrCreateObjectProperty;
    } else {
        reducer = _gpfGetObjectProperty;
    }
    return _gpfReduceContext(path, reducer);
}

/**
 * Resolve the provided contextual path and returns the result.
 *
 * @param {String} path Dot separated list of identifiers
 *
 * @return {gpf.typedef.contextResult} Resolved path
 * @since 0.1.5
 */
gpf.context = function (path) {
    if (undefined === path) {
        return _gpfMainContext;
    }
    return _gpfContext(path.split("."));
};

/*#ifndef(UMD)*/

gpf.internals._gpfContext = _gpfContext;

/*#endif*/
