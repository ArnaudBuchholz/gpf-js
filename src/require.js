/**
 * @file Require implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfArrayForEach*/
/*global _gpfPathJoin*/
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*#endif*/

/* this is globally used as the current context in this module */
/*jshint -W040*/
/*eslint-disable no-invalid-this*/

_gpfErrorDeclare("stream", {

    /**
     * ### Summary
     *
     * Invalid {@link gpf.require.configure} option
     *
     * ### Description
     *
     * This error is triggered whenever an option passed to {@link gpf.require.configure} is not recognized.
     * Please check the {@link gpf.typedef.requireOptions} documentation.
     */
    invalidRequireConfigureOption:
        "Invalid configuration option"
});

/**
 * @typedef gpf.typedef.requireOptions
 * @property {String} [base] Base path used to resolve names
 * @property {Object} [cache] Inject names into the require cache
 * @property {Boolean} [clearCache=false] When set, the require cache is cleared
 */

/**
 * @typedef gpf.typedef._requireContext
 * @property {String} base Base path used to resolve names
 * @property {Object} cache Dictionary of loaded requires
 */

/**
 * Valuate the option priority to have them executed in the proper order
 *
 * @param {String} name option name
 * @return {Number} Option priority
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
 */
var _gpfRequireOptionHandler = {

    base: function (base) {
        this.base = base;
    },

    cache: function (cache) {
        Object.assign(this.cache, cache);
    },

    clearCache: function () {
        this.cache = {};
    }

};

/**
 * Configure the {@link gpf.require} layer
 *
 * @param {gpf.typedef.requireOptions} options Options to configure
 */
function _gpfRequireConfigure (options) {
    var me = this;
    _gpfArrayForEach(Object.keys(options).sort(function (key1, key2) {
        // Some keys must be processed first
        return _gpfRequireOptionPriority(key1) - _gpfRequireOptionPriority(key2);
    }), function (key) {
        (_gpfRequireOptionHandler[key] || gpf.error.invalidRequireConfigureOption).call(me, options[key]);
    }, me);
}

/**
 * Resolves the resource name according to current require context
 *
 * @param {String} name Relative resource name
 * @return {String} Resolved name
 */
function _gpfRequireResolve (name) {
    return _gpfPathJoin(this.base, name);
}

function _gpfRequireLoad (name) {

}

function _gpfRequireGet (name) {
    if (this.cache[name]) {
        return Promise.resolve(this.cache[name]);
    }
    return _gpfRequireLoad.call(this, name);
}

/**
 * Load all resources and pass them to the factory function as a single object
 *
 * @param {Object} dependencies Dictionary of dependencies, the keys are preserved while passing the result
 * dictionary to the factory function
 * @param {Function|*} factory Can be either:
 * * A factory function executed when all dependencies are resolved, the first parameter will be a dictionary
 *   giving access to all dependencies by their name. The result of the factory function will be cached as the result
 *   of this resource (if loaded through gpf.require)
 * * A value that will be cached as well
 * @return {Promise<*>} Resolved with the factory function result or the object
 */
function _gpfRequire (dependencies, factory) {
    var me = this,
        promises = [],
        keys = Object.keys(dependencies);
    _gpfArrayForEach(keys, function (key) {
        promises.push(_gpfRequireGet(_gpfRequireResolve.call(me, dependencies[key])));
    }, me);
    return Promise.all(promises)
        .then(function (resources) {
            var result,
                require;
            if ("function" === typeof factory) {
                _gpfArrayForEach(keys, function (key, index) {
                    require[key] = resources[index];
                });
                result = factory(require);
            } else {
                result = factory;
            }
            if (me.name) {
                me.cache[me.name] = result;
            }
            return result;
        });
}

/**
 * Allocate a new require function with the proper configure / resolve
 *
 * @param {Object} parentContext Context to inherit from
 * @return {Function} See {@gpf.require}
 */
function _gpfRequireAllocate (parentContext) {
    var context = {
            base: parentContext.base,
            cache: Object.create(parentContext.cache) // ?!?
        },
        require = _gpfRequire.bind(context);
    require.configure = _gpfRequireConfigure.bind(context);
    require.resolve = _gpfRequireResolve.bind(context);
    return require;
}

/** @gpf:sameas _gpfRequire */
gpf.require = _gpfRequireAllocate({
    base: "",
    cache: {}
});

/**
 * @method gpf.require.configure
 * @gpf:sameas _gpfRequireConfigure
 */

/**
 * @method gpf.require.resolve
 * @gpf:sameas _gpfRequireResolve
 */
