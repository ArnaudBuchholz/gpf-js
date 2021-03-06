/**
 * @file Path matcher
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAssert*/ // Assertion method
/*global _gpfPathDecompose*/ // Normalize path and returns an array of parts
/*#endif*/

var _GPF_PATHMATCH_UNKNOWN = 0,
    _GPF_PATHMATCH_OK = 1,
    _GPF_PATHMATCH_KO = 2;

//region Pattern parsing

// Split the part to be processed in _GpfPathMatcher#_matchName
function _gpfPatternPartSplit (part) {
    return part.split("*");
}

// Split the pattern on /, process each part individually
function _gpfPatternSplit (pattern) {
    return pattern
        .split("/")
        .map(_gpfPatternPartSplit);
}

function _gpfPatternBuildStart (matcher, pattern, pos) {
    if (0 < pos) {
        _gpfAssert(pattern.charAt(pos - 1) === "/", "** must be preceded by /");
        matcher.start = _gpfPatternSplit(pattern.substr(0, pos - 1)); // skip /
    }
}

function _gpfPatternBuildEnd (matcher, pattern, pos) {
    if (pos < pattern.length - 2) {
        _gpfAssert(pattern.charAt(pos + 2) === "/", "** must be followed by /");
        matcher.end = _gpfPatternSplit(pattern.substr(pos + 3)).reverse(); // skip /
    }
}

function _gpfCheckPathMatcherGeneric (matcher, pattern) {
    /**
     * if any use of "**", split the pattern in two:
     * - the before part: start
     * - the after part: end
     * (otherwise, it is only the before part)
     */
    var pos = pattern.indexOf("**");
    if (-1 === pos) {
        matcher.start = _gpfPatternSplit(pattern);
    } else {
        _gpfPatternBuildStart(matcher, pattern, pos);
        _gpfPatternBuildEnd(matcher, pattern, pos);
    }
}

//endregion

/**
 * @param {String} pattern
 *
 * @class _GpfLikeContext
 * @constructor
 */
function _GpfPathMatcher (pattern) {
    /*jshint validthis:true*/
/*#ifdef(DEBUG)*/
    this._dbgSource = pattern;
/*#endif*/

    if ("!" === pattern.charAt(0)) {
        this.negative = true;
        pattern = pattern.substr(1);
    }

    _gpfCheckPathMatcherGeneric(this, pattern);
}

/**
 * Convert - if necessary - the pattern parameter
 *
 * @param {_GpfPathMatcher|String} pattern
 * @return {_GpfPathMatcher}
 */
function _gpfPathMatchCompilePattern (pattern) {
    if (pattern instanceof _GpfPathMatcher) {
        return pattern;
    }
    return new _GpfPathMatcher(pattern);
}

/**
 * Convert - if necessary - the pattern parameter
 *
 * @param {Array|String} pattern
 * @return {_GpfPathMatcher[]}
 */
function _gpfPathMatchCompilePatterns (pattern) {
    if (pattern instanceof Array) {
        return pattern.map(_gpfPathMatchCompilePattern);
    }
    return [_gpfPathMatchCompilePattern(pattern)];
}

// After matching a path item
function _gpfPathMatchAfterApplyNonMatching (pathMatcher) {
    /*jshint validthis:true*/
    if (pathMatcher.negative) {
        this.result = true;
        return false; // Stop the main loop
    }
    return true; // continue
}

/**
 * Match a path item
 *
 * @param pathMatcher
 * @this An object containing
 * - {String[]} parts the path being tested split in parts
 * - {Boolean} [result=undefined] result the result
 */
function _gpfPathMatchApply (pathMatcher) {
    /*jshint validthis:true*/
    if (pathMatcher.match(this.parts)) {
        this.result = !pathMatcher.negative;
        return false; // Stop the main loop
    }
    return _gpfPathMatchAfterApplyNonMatching.call(this, pathMatcher);
}

/**
 * Match the pattern with the path
 * @param {Array|String} pattern
 * @param {String} path
 * @return {Boolean|undefined}
 */
function _gpfPathMatch (pattern, path) {
    var parts = _gpfPathDecompose(path),
        matchers = _gpfPathMatchCompilePatterns(pattern),
        scope = {
            parts: parts
        };
    matchers.every(_gpfPathMatchApply, scope);
    return scope.result;
}

_GpfPathMatcher.prototype = {

    constructor: _GpfPathMatcher,

/*#ifdef(DEBUG)*/

    // Source of the pattern
    _dbgSource: "",

/*#endif*/


    // Indicate the pattern started with !
    negative: false,

    /**
     * List of name patterns to be applied on the beginning of the path
     *
     * @type {String[]}
     */
    start: null,

    /**
     * List of name patterns to be applied on the end of the path (note they are in the reverse order)
     *
     * @type {String[]}
     */
    end: null,

    /**
     * When no * is used, the namePattern must exactly match the part.
     * Otherwise the * represents a variable part in the part.
     * It may contain as many variable part as necessary.
     *
     * a*b  matches     (start)a(anything)b(end)
     * *b   matches     b(end)
     * a*   matches     (start)a
     *
     * @param {String[]} fixedPatterns
     * @param {String} part
     */
    _matchName: function (fixedPatterns, part) {
        var lastPattern = "",
            pos = 0;
        if (fixedPatterns.every(function (fixedPattern, index) {
            var lastPatternLength = lastPattern.length;
            lastPattern = fixedPattern || "";
            if (lastPattern) {
                pos = part.indexOf(fixedPattern, pos + lastPatternLength);
                // part not found means not matching
                if (-1 === pos) {
                    return false;
                }
                // the first part must match the beginning
                if (0 === index && 0 < pos) {
                    return false;
                }
            }
            return true;
        })) {
            /**
             * If empty, we match (because we don't care about the end)
             * Otherwise, it should leads us to the end of the part.
             */
            return !lastPattern || pos + lastPattern.length === part.length;
        }
        return false;
    },

    // Match using this.start (if any)
    _matchStart: function (context) {
        if (this.start) {
            return this._matchStartUnsafe(context);
        }
        return _GPF_PATHMATCH_UNKNOWN;
    },

    // Match using this.start
    _matchStartUnsafe: function (context) {
        var parts = context.parts,
            partsLen = parts.length,
            startPos = context.startPos,
            array = this.start,
            len = array.length,
            idx;
        for (idx = 0; idx < len; ++idx) {
            if (this._matchName(array[idx], parts[startPos])) {
                if (++startPos >= partsLen) {
                    // Match if last part of the start and no end
                    if (idx === len - 1 && !this.end) {
                        return _GPF_PATHMATCH_OK;
                    }
                    return _GPF_PATHMATCH_KO;
                }
            } else {
                return _GPF_PATHMATCH_KO;
            }
        }
        context.startPos = startPos;
        return _GPF_PATHMATCH_UNKNOWN;
    },

    // Match using this.end (if any)
    _matchEnd: function (context) {
        if (this.end) {
            return this._matchEndUnsafe(context);
        }
        return _GPF_PATHMATCH_UNKNOWN;
    },

    // Match using this.end
    _matchEndUnsafe: function (context) {
        var parts = context.parts,
            startPos = context.startPos,
            endPos = parts.length - 1,
            array = this.end,
            len = array.length,
            idx;
        for (idx = 0; idx < len; ++idx) {
            if (-1 < endPos && this._matchName(array[idx], parts[endPos])) {
                if (endPos-- < startPos) {
                    return _GPF_PATHMATCH_KO;
                }
            } else {
                return _GPF_PATHMATCH_KO;
            }
        }
        return _GPF_PATHMATCH_UNKNOWN;
    },

    /**
     * Matches the provided path
     *
     * @param {String[]} parts
     * @return {Boolean}
     */
    match: function (parts) {
        var result,
            context = {
                parts: parts,
                startPos: 0
            };
        result = this._matchStart(context) || this._matchEnd(context);
        return result !== _GPF_PATHMATCH_KO;
    }

};

Object.assign(gpf.path, {

    /**
     * Matches the provided path
     *
     * PATTERN FORMAT
     * - An optional prefix "!" negates the pattern
     * - Path separator are /
     * - In a DOS environment, path is transformed to lowercase and path separators are converted to / (hence the
     *   pattern remains the same)
     * - A leading slash matches the beginning of the pathname. For example, "/*.c" matches "cat-file.c" but not
     *   "mozilla-sha1/sha1.c".
     * - Two consecutive asterisks ("**") in patterns matched against full pathname may have special meaning:
     *   - A leading "**" followed by a slash means match in all directories.
     *     For example, "**" + "/foo" matches file or directory "foo" anywhere, the same as pattern "foo".
     *     "**" + "/foo/bar" matches file or directory "bar" anywhere that is directly under directory "foo".
     *   - A trailing "/**" matches everything inside. For example, "abc/**" matches all files inside directory "abc"
     *   - A slash followed by two consecutive asterisks then a slash matches zero or more directories.
     *     For example, "a/**" + "/b" matches "a/b", "a/x/b", "a/x/y/b" and so on.
     * Other consecutive asterisks are considered invalid.
     *
     * @param {Array|String} pattern
     * @param {String} path
     * @return {Boolean}
     */
    match: function (pattern, path) {
        return _gpfPathMatch(pattern, path) || false;
    },

    /**
     * Process the pattern and return an array that can be used in match.
     * NOTE this is not mandatory but if you reuse the same pattern multiple times, this will make it more efficient
     *
     * @param {Array|String} pattern
     * @return {Array}
     */
    compileMatchPattern: function (pattern) {
        return _gpfPathMatchCompilePatterns(pattern);
    }

});
