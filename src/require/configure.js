/**
 * @file Require configuration implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*exported _gpfRequireConfigure*/ // Configure the {@link gpf.require} layer
/*exported _gpfRequireConfigureAddOption*/
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
 * @property {Object} [preload] Inject names into the loading cache
 * @property {gpf.typedef.requirePreprocessFunc} [preprocess] Resource preprocessor
 * @since 0.2.2
 */

/**
 * Dictionary of option name to function handling the option
 * @type {Object}
 * @since 0.2.2
 */
var _gpfRequireConfigureHandler = {};

var _gpfRequireConfigureOptionNames = [];

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
    _gpfArrayForEach(_gpfRequireConfigureOptionNames), function (name) {
        _gpfRequireOptionHandler[name].call(me, options[name]);
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
