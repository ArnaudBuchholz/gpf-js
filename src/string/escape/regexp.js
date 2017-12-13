/**
 * @file Definition of RegExp escapes
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfStringEscapes*/ // Dictionary of language to escapes
/*global _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
/*#endif*/

_gpfStringEscapes.regexp = _gpfSyncReadSourceJSON("string/escape/regexp.json");
