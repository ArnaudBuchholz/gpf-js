/**
 * @file Helper to escape strings
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAssert*/ // Assertion method
/*global _gpfStringReplaceEx*/ // String replacement using dictionary map
/*exported _gpfStringEscapeFor*/ // Make the string content compatible with lang
/*exported _gpfStringEscapes*/ // Dictionary of language to escapes
/*#endif*/

// Dictionary of language to escapes
var _gpfStringEscapes = {};

/**
 *
 * Make the string content compatible with a given language
 *
 * @param {String} that String to escape
 * @param {String} language Language to escape the string for. Supported values are:
 * - **"javascript"**: escape \ and formatting characters then adds double quotes around the string
 * - **"xml"**: escape &, < and >
 * - **"html"**: xml + some accentuated characters
 * @return {String} Escaped string
 */
function _gpfStringEscapeFor (that, language) {
    _gpfAssert(undefined !== _gpfStringEscapes[language], "Unknown language");
    that = _gpfStringReplaceEx(that, _gpfStringEscapes[language]);
    if ("javascript" === language) {
        that = "\"" + that + "\"";
    }
    return that;
}

/*#ifndef(UMD)*/

gpf.internals._gpfStringEscapeFor = _gpfStringEscapeFor;

/*#endif*/
