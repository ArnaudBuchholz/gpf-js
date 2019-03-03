/**
 * @file Require implementation
 * @since 0.2.2
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfArrayForEach*/ // Almost like [].forEach (undefined are also enumerated)
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfPathJoin*/ // Join all arguments together and normalize the resulting path
/*global _gpfRequireLoad*/ // Load the resource
/*global _gpfRequireConfigure*/ // Configure the {@link gpf.require} layer
/*exported _gpfRequireAllocate*/ // Allocate a new require context with the proper methods
/*#endif*/

/* this is globally used as the current context in this module */
/*jshint -W040*/
/*eslint-disable no-invalid-this*/

/**
 * @typedef gpf.typedef._requireContext
 * @property {String} base Base path used to resolve names
 * @property {Object} cache Dictionary of loaded requires
 * @property {Object} preload Dictionary of preloaded requires
 * @property {gpf.typedef.requirePreprocessFunc} preprocess Preprocess function
 * @since 0.2.2
 */

/**
 * Resolves the resource name according to current require context.
 *
 * @param {String} name Relative resource name
 * @return {String} Resolved name
 * @since 0.2.2
 *
 */
function _gpfRequireResolve (name) {
    return _gpfPathJoin(this.base, name);
}

function _gpfRequireDocumentStack (reason, name) {
    if (!Array.isArray(reason.requires)) {
        reason.requires = [];
    }
    reason.requires.push(name);
}

/**
 * Get the cached resource or load it
 *
 * @param {String} name Resource name
 * @return {Promise<*>} Resource association
 * @since 0.2.2
 */
function _gpfRequireGet (name) {
    var me = this,
        promise;
    if (me.cache[name]) {
        return me.cache[name];
    }
    promise = _gpfRequireLoad.call(me, name);
    me.cache[name] = promise;
    return promise["catch"](function (reason) {
        _gpfRequireDocumentStack(reason, name);
        return Promise.reject(reason);
    });
}

/**
 * Defines a new module by executing the factory function with the specified dependent resources,
 * see {@tutorial REQUIRE}
 *
 *
 * @param {Object} dependencies Dictionary of dependencies, the keys are preserved while passing the result
 * dictionary to the factory function
 * @param {*} factory Can be either:
 * * A factory function executed when all resources are resolved, the first parameter will be a dictionary
 *   with all dependencies indexed by their name (as initially specified in the dependencies parameter).
 *   The result of the factory function will be cached as the result of this resource
 * * Any value that will be cached as the result of this resource
 * @return {Promise<*>} Resolved with the factory function result or the object
 * @since 0.2.2
 */
function _gpfRequireDefine (dependencies, factory) {
    var me = this,
        promises = [],
        keys = Object.keys(dependencies);
    _gpfArrayForEach(keys, function (key) {
        promises.push(_gpfRequireGet.call(me, _gpfRequireResolve.call(me, dependencies[key])));
    }, me);
    return Promise.all(promises)
        .then(function (resources) {
            var result,
                require;
            if (typeof factory === "function") {
                require = {};
                _gpfArrayForEach(keys, function (key, index) {
                    require[key] = resources[index];
                });
                result = factory(require);
            } else {
                result = factory;
            }
            return result;
        });
}

/**
 * Allocate a new require context with the proper methods
 *
 * @param {Object} parentContext Context to inherit from
 * @param {gpf.typedef.requireOptions} [options] Options to configure
 * @return {Object} Containing {@link gpf.require.define}, {@link gpf.require.resolve} and {@link gpf.require.configure}
 * @since 0.2.2
 */
function _gpfRequireAllocate (parentContext, options) {
    var context = Object.create(parentContext), // cache content is shared but other properties are protected
        require = {};
    require.define = _gpfRequireDefine.bind(context);
    require.resolve = _gpfRequireResolve.bind(context);
    require.configure = _gpfRequireConfigure.bind(context);
    if (options) {
        require.configure(options);
    }
    return require;
}

gpf.require = _gpfRequireAllocate({
    base: "",
    cache: {},
    preload: {},
    preprocess: function (resource) {
        return Promise.resolve(resource);
    }
});

/**
 * @method gpf.require.define
 * @gpf:sameas _gpfRequireDefine
 * @since 0.2.2
 */

/**
 * @method gpf.require.resolve
 * @gpf:sameas _gpfRequireResolve
 * @since 0.2.2
 *
 * @example <caption>Setting the base path</caption>
 * gpf.require.configure({
 *   base: "/test/require"
 * });
 * assert(gpf.require.resolve("file.js") === "/test/require/file.js");
 */
