/**
 * @file Regular Expession helper
 */
/*#ifndef(UMD)*/
"use strict";
/*exported _gpfRegExpForEach*/ // Executes the callback for each match of the regular expression
/*#endif*/

/**
 * Callback function executed on each regular expression match
 *
 * @callback gpf.typedef.regExpForEachCallback
 *
 * @param {Array} match The current match
 * @param {String} string The string that is currently being matched
 */

/**
 * Executes the callback for each match of the regular expression.
 * When configured with /g and used before,
 * the [lastIndex](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/lastIndex)
 * must be first reset
 *
 * @param {RegExp} regexp Regular expression to execute
 * @param {String} string String to match
 * @param {gpf.typedef.regExpForEachCallback} callback Callback function executed on each match
 */
function _gpfRegExpForEach (regexp, string, callback) {
    var match;
    /*jshint -W084*/ // to avoid repeating twice the exec
    while (match = regexp.exec(string)) { //eslint-disable-line no-cond-assign
        callback(match, string);
    }
}
/*jshint +W084*/
