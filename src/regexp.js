/**
 * @file Regular Expression helper
 * @since 0.2.1
 */
/*#ifndef(UMD)*/
"use strict";
/*exported _gpfRegExpEscape*/ //  Escape the value so that it can be safely inserted in a regular expression
/*exported _gpfRegExpForEach*/ // Executes the callback for each match of the regular expression
/*#endif*/

var _gpfRegExpEscapeRE = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;

/**
 * Escape the value so that it can be safely inserted in a regular expression
 *
 * @param {String} value to escape
 * @return {String} Escaped value
 */
function _gpfRegExpEscape (value) {
    return value.replace(_gpfRegExpEscapeRE, "\\$&");
}

/**
 * Callback function executed on each regular expression match
 *
 * @callback gpf.typedef.regExpForEachCallback
 *
 * @param {Array} match The current match
 * @param {String} string The string that is currently being matched
 * @since 0.2.1
 */

function _gpfRegExpGetNextMatch (regexp, string) {
    return regexp.exec(string);
}

function _gpfRegExpGetFirstMatch (regexp, string) {
    regexp.lastIndex = 0;
    return _gpfRegExpGetNextMatch(regexp, string);
}

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
    var matches = [],
        match = _gpfRegExpGetFirstMatch(regexp, string);
    while (match) {
        matches.push(match);
        match = _gpfRegExpGetNextMatch(regexp, string);
    }
    return matches;
}
