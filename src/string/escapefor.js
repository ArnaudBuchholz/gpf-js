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
 * Make the string content compatible with a given language
 *
 * @param {String} that
 * @param {String} language
 * @return {String}
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
