/*#ifndef(UMD)*/
"use strict";
/*global _gpfAssert*/ // Assertion method
/*global _gpfExtend*/ // gpf.extend
/*global _gpfPathDecompose*/ // Normalize path and returns an array of parts
/*#endif*/

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
    var negative = pathMatcher.negative;
    if (pathMatcher.match(this.parts)) {
        this.result = !negative;
        return false; // Stop the main loop
    }
    if (negative) {
        this.result = true;
        return false; // Stop the main loop
    }
    return true; // continue
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
        var
            len = fixedPatterns.length,
            idx,
            fixedPattern,
            pos = 0; // end
        for (idx = 0; idx < len; ++idx) {
            fixedPattern = fixedPatterns[idx];
            // an empty pattern correspond to a star position
            if (fixedPattern) {
                pos = part.indexOf(fixedPattern, pos);
                // part not found means not matching
                if (-1 === pos) {
                    return false;
                }
                // the first part must match the beginning
                if (0 === idx && 0 < pos) {
                    return false;
                }
            }
        }
        /**
         * fixedPattern represents the last pattern used (and matching)
         * If empty, we match (because we don't care about the end)
         * Otherwise, it should leads us to the end of the part.
         */
        return !fixedPattern || pos + fixedPattern.length === part.length;
    },

    _matchStart: function (context) {
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
                    return idx === len - 1 && !this.end;
                }
            } else {
                return false;
            }
        }
        context.startPos = startPos;
        return undefined;
    },

    _matchEnd: function (context) {
        var parts = context.parts,
            startPos = context.startPos,
            endPos = parts.length - 1,
            array = this.end,
            len = array.length,
            idx;
        for (idx = 0; idx < len; ++idx) {
            if (-1 < endPos && this._matchName(array[idx], parts[endPos])) {
                if (endPos-- < startPos) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return undefined;
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
        if (this.start) {
            result = this._matchStart(context);
            if (undefined !== result) {
                return result;
            }
        }
        if (this.end) {
            result = this._matchEnd(context);
            if (undefined !== result) {
                return result;
            }
        }
        return true;
    }

};

_gpfExtend(gpf.path, {

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
