/**
 * @file Require base configuration option
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfRequireConfigureAddOption*/
/*#endif*/

function _gpfRequireConfigureBase (context, value) {
    context.base = value;
}

_gpfRequireConfigureAddOption("base", _gpfRequireConfigureBase);
