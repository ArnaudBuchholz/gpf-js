/**
 * @file Definition of JavaScript escapes
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfStringEscapeFor*/ // Make the string content compatible with lang
/*global _gpfStringEscapes*/ // Dictionary of language to escapes
/*global _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
/*exported _gpfStringEscapeForJavascript*/ // String escape for JavaScript
/*#endif*/

var _GPF_STRING_ESCAPE_JAVASCRIPT = "javascript";

_gpfStringEscapes[_GPF_STRING_ESCAPE_JAVASCRIPT] = _gpfSyncReadSourceJSON("string/escape/javascript.json");

function _gpfStringEscapeForJavascript (that) {
    return _gpfStringEscapeFor(that, _GPF_STRING_ESCAPE_JAVASCRIPT);
}
