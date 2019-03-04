/**
 * @file Require configuration implementation
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfArrayForEach*/ // Almost like [].forEach (undefined are also enumerated)
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*exported _gpfRequireConfigure*/ // Configure the {@link gpf.require} layer
/*exported _gpfRequireConfigureAddOption*/ // Declare a configuration option
/*#endif*/

/* this is globally used as the current context in this module */
/*jshint -W040*/
/*eslint-disable no-invalid-this*/

_gpfErrorDeclare("require/configure", {

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
        "Invalid configuration option",

    /**
     * ### Summary
     *
     * Invalid {@link gpf.require.configure} option value
     *
     * ### Description
     *
     * This error is triggered whenever an option passed to {@link gpf.require.configure} has an invalid value.
     * Please check the {@link gpf.typedef.requireOptions} documentation.
     * @since 0.2.9
     */
    invalidRequireConfigureOptionValue:
        "Invalid configuration option value"
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
 * @property {Object} [preload] Inject names into the loading cache
 * @property {gpf.typedef.requirePreprocessFunc} [preprocess] Resource preprocessor
 * @since 0.2.2
 */

var
    /**
     * Dictionary of option name to function handling the option
     * @type {Object}
     * @since 0.2.2
     */
    _gpfRequireConfigureHandler = {},

    /**
     * Array of option names which order is significant
     * @type {Array}
     * @since 0.2.9
     */
    _gpfRequireConfigureOptionNames = [];

/**
 * Declare a configuration option
 *
 * @param {String} name Option name
 * @param {Function} handler Option handler (will receive context and value)
 * @param {Boolean} [highPriority=false] Option must be handled before the others
 * @since 0.2.9
 */
function _gpfRequireConfigureAddOption (name, handler, highPriority) {
    if (highPriority) {
        _gpfRequireConfigureOptionNames.unshift(name);
    } else {
        _gpfRequireConfigureOptionNames.push(name);
    }
    _gpfRequireConfigureHandler[name] = handler;
}

function _gpfRequireConfigureCheckOptions (options) {
    _gpfArrayForEach(Object.keys(options), function (name) {
        if (!_gpfRequireConfigureHandler[name]) {
            gpf.Error.invalidRequireConfigureOption();
        }
    });
}

/**
 * Configure the {@link gpf.require} layer
 *
 * @param {gpf.typedef.requireOptions} options Options to configure
 * @throws {gpf.Error.InvalidRequireConfigureOption}
 * @since 0.2.2
 */
function _gpfRequireConfigure (options) {
    _gpfRequireConfigureCheckOptions(options);
    var me = this;
    _gpfArrayForEach(_gpfRequireConfigureOptionNames.filter(function (name) {
        return options[name] !== undefined;
    }), function (name) {
        _gpfRequireConfigureHandler[name](me, options[name]);
    });
}

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
