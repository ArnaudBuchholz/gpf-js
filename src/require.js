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
/*exported _gpfRequireAllocate*/ // Allocate a new require context with the proper methods
/*#endif*/

/* this is globally used as the current context in this module */
/*jshint -W040*/
/*eslint-disable no-invalid-this*/

_gpfErrorDeclare("require", {

    /**
     * ### Summary
     *
     * Invalid {@link gpf.require.configure} option
     *
     * ### Description
     *
     * This error is triggered whenever an option passed to {@link gpf.require.configure} is not recognized.
     * Please check the {@link gpf.typedef.requireOptions} documentation.
     * @since 0.2.2
     */
    invalidRequireConfigureOption:
        "Invalid configuration option"
});

/**
 * @namespace gpf.require
 * @description Root namespace for the modularization helpers.
 * @since 0.2.2
 */

/**
 * @typedef gpf.typedef.requireOptions
 * @property {String} [base] Base path used to resolve names
 * @property {Object} [cache] Inject names into the require cache
 * @property {Boolean} [clearCache=false] When set, the require cache is first cleared
 * @since 0.2.2
 */

/**
 * @typedef gpf.typedef._requireContext
 * @property {String} base Base path used to resolve names
 * @property {Object} cache Dictionary of loaded requires
 * @since 0.2.2
 */

/**
 * Valuate the option priority to have them executed in the proper order
 *
 * @param {String} name option name
 * @return {Number} Option priority
 * @since 0.2.2
 */
function _gpfRequireOptionPriority (name) {
    if ("clearCache" === name) {
        return -1;
    }
    return 1;
}

/**
 *  Dictionary of option name to function handling the option
 * @type {Object}
 * @since 0.2.2
 */
var _gpfRequireOptionHandler = {

    base: function (base) {
        this.base = base;
    },

    cache: function (cache) {
        _gpfArrayForEach(Object.keys(cache), function (name) {
            this.cache[name] = Promise.resolve(cache[name]);
        }, this);
    },

    clearCache: function () {
        this.cache = {};
    }

};

/**
 * Configure the {@link gpf.require} layer
 *
 * @param {gpf.typedef.requireOptions} options Options to configure
 * @since 0.2.2
 */
function _gpfRequireConfigure (options) {
    var me = this;
    _gpfArrayForEach(Object.keys(options).sort(function (key1, key2) {
        // Some keys must be processed first
        return _gpfRequireOptionPriority(key1) - _gpfRequireOptionPriority(key2);
    }), function (key) {
        (_gpfRequireOptionHandler[key] || gpf.Error.invalidRequireConfigureOption).call(me, options[key]);
    }, me);
}

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
            if ("function" === typeof factory) {
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
    cache: {}
});

/**
 * @method gpf.require.define
 * @gpf:sameas _gpfRequireDefine
 * @since 0.2.2
 */

/**
 * @method gpf.require.configure
 * @gpf:sameas _gpfRequireConfigure
 * @since 0.2.2
 *
 * @example <caption>Setting the base path</caption>
 * gpf.require.configure({
 *   base: "/test/require"
 * });
 * assert(gpf.require.resolve("file.js") === "/test/require/file.js");
 *
 * @example <caption>Injecting in the cache</caption>
 * var cache = {};
 * cache[gpf.require.resolve("data.json")] = {};
 * gpf.require.configure({
 *   clearCache: true,
 *   cache: cache
 * });
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
