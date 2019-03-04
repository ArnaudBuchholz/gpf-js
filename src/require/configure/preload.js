
/**
 * @file Require preload configuration option
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfArrayForEach*/ // Almost like [].forEach (undefined are also enumerated)
/*global _gpfRequireConfigureAddOption*/ // Declare a configuration option
/*#endif*/

function _gpfRequireConfigureCheckPreload (value) {
    if (typeof value !== "object") {
        gpf.Error.invalidRequireConfigureOptionValue();
    }
}

function _gpfRequireConfigurePreload (context, value) {
    _gpfRequireConfigureCheckPreload(value);
    _gpfArrayForEach(Object.keys(value), function (name) {
        context.preload[name] = value[name];
    });
}

_gpfRequireConfigureAddOption("preload", _gpfRequireConfigurePreload);
