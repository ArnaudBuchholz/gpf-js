/**
 * @file Require base configuration option
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfRequireConfigureAddOption*/ // Declare a configuration option
/*#endif*/

function _gpfRequireConfigureCheckBase (value) {
    if (typeof value !== "string") {
        gpf.Error.invalidRequireConfigureOptionValue();
    }
}

function _gpfRequireConfigureBase (context, value) {
    _gpfRequireConfigureCheckBase(value);
    context.base = value;
}

_gpfRequireConfigureAddOption("base", _gpfRequireConfigureBase);
