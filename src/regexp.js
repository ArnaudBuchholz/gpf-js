/**
 * @file Regular Expression helper
 * @since 0.2.1
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
 * @since 0.2.1
 */

/**
 * Executes the callback for each match of the regular expression.
 * When configured with /g and used before,
 * the [lastIndex](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/lastIndex)
 * must be first reset
 *
 * @param {RegExp} regexp Regular expression to execute
 * @param {String} string String to match
 * @return {Array} Array of matches
 * @since 0.2.1
 * @version 0.2.2 Reset lastIndex and returns the array of matches
 */
function _gpfRegExpForEach (regexp, string) {
    var match,
        matches = [];
    regexp.lastIndex = 0;
    /*jshint -W084*/ // to avoid repeating twice the exec
    while (match = regexp.exec(string)) { //eslint-disable-line no-cond-assign
        matches.push(match);
    }
    return matches;
}
/*jshint +W084*/
