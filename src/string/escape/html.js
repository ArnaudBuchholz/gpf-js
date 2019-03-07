/**
 * @file Definition of HTML escapes
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_STRING_ESCAPE_XML*/ // xml escapes key
/*global _gpfStringEscapeFor*/ // Make the string content compatible with lang
/*global _gpfStringEscapes*/ // Dictionary of language to escapes
/*global _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
/*exported _gpfStringEscapeForHtml*/ // String escape for Html
/*#endif*/

var _GPF_STRING_ESCAPE_HTML = "html";

_gpfStringEscapes.html = Object.assign({}, _gpfStringEscapes[_GPF_STRING_ESCAPE_XML],
    _gpfSyncReadSourceJSON("string/escape/html.json"));

function _gpfStringEscapeForHtml (that) {
    return _gpfStringEscapeFor(that, _GPF_STRING_ESCAPE_HTML);
}
