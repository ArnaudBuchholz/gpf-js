/**
 * @file Context management
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
    var rootContext;
    if (path[0] === "gpf") {
        rootContext = gpf;
        path = path.slice(1);
    } else {
        rootContext = _gpfMainContext;
    }
    return path.reduce(reducer, rootContext);
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
    var reducer;
    if (createMissingParts) {
        reducer = _gpfGetOrCreateObjectProperty;
    } else {
        reducer = _gpfGetObjectProperty;
    }
    return _gpfReduceContext(path, reducer);
}

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
