/**
 * @file Require implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfEmptyFunc*/
/*global _gpfArrayForEach*/
/*global _gpfPathJoin*/
/*#endif*/

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
 * @param {requireOptions} options Options to configure
 */
function _gpfRequireConfigure (options) {
    /*jshint validthis:true*/
    var me = this; //eslint-disable-line no-invalid-this
    _gpfArrayForEach(Object.keys(options).sort(function (key1, key2) {
        // Some keys must be processed first
        return _gpfRequireOptionPriority(key1) - _gpfRequireOptionPriority(key2);
    }), function (key) {
        (_gpfRequireOptionHandler[key] || _gpfEmptyFunc).call(me, options[key]);
    }, me);
}

/**
 * Resolves the resource name according to current require context
 *
 * @param {String} name
 * @return {String} Resolved name
 */
function _gpfRequireResolve (name) {
    /*jshint validthis:true*/
    var me = this; //eslint-disable-line no-invalid-this
    return _gpfPathJoin(me.base, name);
}

/**
 * Load all dependencies and pass them to the factory function as a single object
 *
 * @param {Object} dependencies Dictionary of dependencies, the keys are preserved while passing to the factory
 * function
 * @param {Function|*} factory Can be either:
 * * A factory function executed when all dependencies are resolved, the first parameter will be a dictionary
 *   giving access to all dependencies by their name. The result of the factory function will be cached as the result
 *   of this module
 * * A value that will be cached as well
 * @return {Promise<*>} Resolved with the factory result
 */
function _gpfRequire (dependencies, factory) {
    return new Promise();
}

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
