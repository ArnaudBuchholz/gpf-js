/**
 * @file Require clearCache configuration option
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfRequireConfigureAddOption*/ // Declare a configuration option
/*#endif*/

function _gpfRequireConfigureCheckClearCache (value) {
    if (typeof value !== "boolean") {
        gpf.Error.invalidRequireConfigureOptionValue();
    }
}

function _gpfRequireConfigureClearCache (context, value) {
    _gpfRequireConfigureCheckClearCache(value);
    if (value) {
        context.cache = {};
    }
}

_gpfRequireConfigureAddOption("clearCache", _gpfRequireConfigureClearCache, true);
