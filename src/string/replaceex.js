/**
 * @file Helper to replace strings content
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _gpfStringReplaceEx*/ // String replacement using dictionary map
/*#endif*/

/**
 * String replacement using dictionary map
 *
 * @param {String} that String to replace
 * @param {Object} replacements Dictionary of strings where each key is searched to be replaced by the associated value
 * @return {String} Replaced string
 */
function _gpfStringReplaceEx (that, replacements) {
    var result = that;
    _gpfObjectForEach(replacements, function (replacement, key) {
        result = result.split(key).join(replacement);
    });
    return result;
}

/*#ifndef(UMD)*/

gpf.internals._gpfStringReplaceEx = _gpfStringReplaceEx;

/*#endif*/
