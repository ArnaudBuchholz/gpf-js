/**
 * @file JSON polyfill
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfCompatibilityInstallGlobal*/ // Install compatible global if missing
/*global _gpfJsonParsePolyfill*/ // JSON.parse polyfill
/*global _gpfJsonStringifyPolyfill*/ // JSON.stringify polyfill
/*#endif*/

_gpfCompatibilityInstallGlobal("JSON", {
    parse: _gpfJsonParsePolyfill,
    stringify: _gpfJsonStringifyPolyfill
});
