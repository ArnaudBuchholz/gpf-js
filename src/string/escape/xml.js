/**
 * @file Definition of XML escapes
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfStringEscapeFor*/ // Make the string content compatible with lang
/*global _gpfStringEscapes*/ // Dictionary of language to escapes
/*global _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
/*exported _GPF_STRING_ESCAPE_XML*/ // xml escapes key
/*exported _gpfStringEscapeForXml*/ // String escape for Xml
/*#endif*/

var _GPF_STRING_ESCAPE_XML = "xml";

_gpfStringEscapes[_GPF_STRING_ESCAPE_XML] = _gpfSyncReadSourceJSON("string/escape/xml.json");

function _gpfStringEscapeForXml (that) {
    return _gpfStringEscapeFor(that, _GPF_STRING_ESCAPE_XML);
}
