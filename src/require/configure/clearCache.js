/**
 * @file Require clearCache configuration option
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfRequireConfigureAddOption*/
/*#endif*/

function _gpfRequireConfigureClearCache (context, value) {
    if (value) {
      context.cache = {};
    }
}

_gpfRequireConfigureAddOption("clearCache", _gpfRequireConfigureClearCache, true);
