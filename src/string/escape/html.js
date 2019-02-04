/**
 * @file Definition of HTML escapes
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfStringEscapes*/ // Dictionary of language to escapes
/*global _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
/*#endif*/

_gpfStringEscapes.html = Object.assign({}, _gpfStringEscapes.xml, _gpfSyncReadSourceJSON("string/escape/html.json"));

/*#ifndef(UMD)*/

// Generates an empty function to reflect the null complexity of this module
function _gpfStringEscapeHtml () {}
/*exported _gpfStringEscapeHtml*/

/*#endif*/

