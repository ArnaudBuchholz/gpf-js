/*#ifndef(UMD)*/
"use strict";
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _gpfStringReplaceEx*/ // String replacement using dictionary map
/*#endif*/

/**
 * String replacement using dictionary map
 *
 * @param {String} that
 * @param {Object} replacements map of strings to search and replace
 * @return {String}
 */
function _gpfStringReplaceEx (that, replacements) {
    var result = that;
    _gpfObjectForEach(replacements, function (replacement, key) {/*gpf:inline(object)*/
        result = result.split(key).join(replacement);
    });
    return result;
}

/*#ifndef(UMD)*/

gpf.internals._gpfStringReplaceEx = _gpfStringReplaceEx;

/*#endif*/
