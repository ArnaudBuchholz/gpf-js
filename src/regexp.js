/**
 * @file Regular Expression helper
 * @since 0.2.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_START*/ // 0
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

function _gpfRegExpGetNextMatch (regexp, string) {
    return regexp.exec(string);
}

function _gpfRegExpGetFirstMatch (regexp, string) {
    regexp.lastIndex = _GPF_START;
    return _gpfRegExpGetNextMatch(regexp, string);
}

/**
 * Executes the regexp on the string until no match, returns the array of matches.
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

function _gpfRegExpSetToken (match) {
    match.every(function (value, index) {
        if (index && value !== undefined) {
            match.token = index;
            return false;
        }
        return true;
    });
}

/**
 * Same as {@link _gpfRegExpForEach} but each match is augmented with a `token` property giving the index of the first
 * capturing group that got extracted.
 *
 * @param {RegExp} regexp Regular expression to execute
 * @param {String} string String to match
 * @return {Array} Array of matches augmented with token information
 * @since 0.2.1
 * @version 0.2.2 Reset lastIndex and returns the array of matches
 */
function _gpfRegExpTokenize (regexp, string) {
    var matches = _gpfRegExpForEach(regexp, string);
    matches.forEach(_gpfRegExpSetToken);
    return matches;
}

/*#ifndef(UMD)*/

gpf.internals._gpfRegExpTokenize = _gpfRegExpTokenize;

/*#endif*/
