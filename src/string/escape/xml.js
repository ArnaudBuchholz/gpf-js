/**
 * @file Definition of XML escapes
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfStringEscapes*/ // Dictionary of language to escapes
/*global _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
/*#endif*/

_gpfStringEscapes.xml = _gpfSyncReadSourceJSON("string/escape/xml.json");

/*#ifndef(UMD)*/

// Generates an empty function to reflect the null complexity of this module
(function _gpfStringEscapeXml () {}());

/*#endif*/
