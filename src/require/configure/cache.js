/**
 * @file Require cache configuration option
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfArrayForEach*/ // Almost like [].forEach (undefined are also enumerated)
/*global _gpfRequireConfigureAddOption*/ // Declare a configuration option
/*#endif*/

function _gpfRequireConfigureCheckCache (value) {
    if (typeof value !== "object") {
        gpf.Error.invalidRequireConfigureOptionValue();
    }
}

function _gpfRequireConfigureCache (context, value) {
    _gpfRequireConfigureCheckCache(value);
    _gpfArrayForEach(Object.keys(value), function (name) {
        context.cache[name] = Promise.resolve(value[name]);
    });
}

_gpfRequireConfigureAddOption("cache", _gpfRequireConfigureCache);
