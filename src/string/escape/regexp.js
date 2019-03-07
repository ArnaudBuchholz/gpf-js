/**
 * @file Definition of RegExp escapes
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfStringEscapeFor*/ // Make the string content compatible with lang
/*global _gpfStringEscapes*/ // Dictionary of language to escapes
/*global _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
/*exported _gpfStringEscapeForRegexp*/ // String escape for RegExp
/*#endif*/

var _GPF_STRING_ESCAPE_REGEXP = "regexp";

_gpfStringEscapes[_GPF_STRING_ESCAPE_REGEXP] = _gpfSyncReadSourceJSON("string/escape/regexp.json");

function _gpfStringEscapeForRegexp (that) {
    return _gpfStringEscapeFor(that, _GPF_STRING_ESCAPE_REGEXP);
}
