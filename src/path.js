/*#ifndef(UMD)*/
"use strict";
/*global _gpfDosPath*/ // DOS-like path
/*#endif*/

var
    /**
     * Split the part to be processed in _GpfPathMatcher#_matchName
     *
     * @param {String} part
     * @private
     */
    _gpfPatternPartSplit = function (part) {
        return part.split("*");
    },

    /**
     *
     * @param {String} pattern
     *
     * @class _GpfLikeContext
     * @constructor
     * @private
     */
    _GpfPathMatcher = function (pattern) {
/*#ifdef(DEBUG)*/
        this._dbgSource = pattern;
/*#endif*/

        if ("!" === pattern.charAt(0)) {
            this.negative = true;
            pattern = pattern.substr(1);
        }
        /**
         * if any use of "**", split the pattern in two:
         * - the before part: start
         * - the after part: end
         * (otherwise, it is only the before part)
         */
        var pos = pattern.indexOf("**");
        if (-1 === pos) {
            this.start = pattern
                            .split("/")
                            .map(_gpfPatternPartSplit);
        } else {
            if (0 < pos) {
                gpf.ASSERT(pattern.charAt(pos - 1) === "/",
                    "** must be preceded by /");
                this.start = pattern
                                .substr(0, pos - 1) // skip /
                                .split("/")
                                .map(_gpfPatternPartSplit);
            }
            if (pos < pattern.length - 2) {
                gpf.ASSERT(pattern.charAt(pos + 2) === "/",
                    "** must be followed by /");
                this.end = pattern
                                .substr(pos + 3) // skip /
                                .split("/")
                                .map(_gpfPatternPartSplit)
                                .reverse();
            }
        }
    },


    /**
     * Convert - if necessary - the pattern parameter
     *
     * @param {_GpfPathMatcher|String} pattern
     * @return {_GpfPathMatcher}
     * @private
     */
    _gpfPathMatchCompilePattern = function (pattern) {
        if (pattern instanceof _GpfPathMatcher) {
            return pattern;
        } else {
            return new _GpfPathMatcher(pattern);
        }
    },

    /**
     * Convert - if necessary - the pattern parameter
     *
     * @param {Array|String} pattern
     * @return {_GpfPathMatcher[]}
     * @private
     */
    _gpfPathMatchCompilePatterns = function (pattern) {
        if (pattern instanceof Array) {
            return pattern.map(_gpfPathMatchCompilePattern);
        } else {
            return [_gpfPathMatchCompilePattern(pattern)];
        }
    },

    /**
     * Match a path item
     *
     * @param pathMatcher
     * @this An object containing
     * <ul>
     *      <li>{String[]} parts the path being tested split in parts</li>
     *      <li>{Boolean} [result=undefined] result the result</li>
     * </ul>
     * @private
     */
    _gpfPathMatchApply = function (pathMatcher) {
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
    },

    /**
     * Match the pattern with the path
     * @param {Array|String} pattern
     * @param {String} path
     * @return {Boolean|undefined}
     * @private
     */
    _gpfPathMatch = function (pattern, path) {
        if (_gpfDosPath) {
            path = path.toLowerCase().split("\\").join("/");
        }
        var parts = path.split("/"),
            matchers = _gpfPathMatchCompilePatterns(pattern),
            scope = {
                parts: parts
            };
        matchers.every(_gpfPathMatchApply, scope);
        return scope.result;
    };

_GpfPathMatcher.prototype = {

    constructor: _GpfPathMatcher,

/*#ifdef(DEBUG)*/

    /**
     * Source of the pattern
     *
     * @type {String}
     * @private
     */
    _dbgSource: "",

/*#endif*/


    /**
     * Indicate the pattern started with !
     *
     * @type {Boolean}
     * @private
     */
    negative: false,

    /**
     * List of name patterns to be applied on the beginning of the path
     *
     * @type {String[]}
     */
    start: null,

    /**
     * List of name patterns to be applied on the end of the path
     * (note they are in the reverse order)
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
     * @private
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

    /**
     * Matches the provided path
     *
     * @param {String[]} parts
     * @return {Boolean}
     */
    match: function (parts) {
        var partsLen = parts.length,
            startPos = 0,
            endPos = partsLen - 1,
            array,
            len,
            idx;
        if (this.start) {
            array = this.start;
            len = array.length;
            for (idx = 0; idx < len; ++idx) {
                if (this._matchName(array[idx], parts[startPos])) {
                    if (++startPos > partsLen) {
                        return false;
                    }
                } else {
                    return false;
                }
            }
        }
        if (this.end) {
            array = this.end;
            len = array.length;
            for (idx = 0; idx < len; ++idx) {
                if (this._matchName(array[idx], parts[endPos])) {
                    if (endPos-- < startPos) {
                        return false;
                    }
                } else {
                    return false;
                }
            }
        }
        return true;
    }

};

gpf.path = {

    /**
     * Matches the provided path
     *
     * PATTERN FORMAT
     * - An optional prefix "!" negates the pattern
     * - Path separator are /
     * - In a DOS environment, path is transformed to lowercase and path
     * separators are converted to / (hence the pattern remains the same)
     * - A leading slash matches the beginning of the pathname. For example,
     * "/*.c" matches "cat-file.c" but not "mozilla-sha1/sha1.c".
     * - Two consecutive asterisks ("**") in patterns matched against full
     * pathname may have special meaning:
     *   - A leading "**" followed by a slash means match in all directories.
     *   For example, "**" + "/foo" matches file or directory "foo" anywhere,
     *   the same as pattern "foo". "**" + "/foo/bar" matches file or directory
     *   "bar" anywhere that is directly under directory "foo".
     *   - A trailing "/**" matches everything inside. For example, "abc/**"
     *   matches all files inside directory "abc"
     *   - A slash followed by two consecutive asterisks then a slash matches
     *   zero or more directories. For example, "a/**" + "/b" matches "a/b",
     *   "a/x/b", "a/x/y/b" and so on.
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
     * Process the pattern and return an array that can be used in match
     * NOTE this is not mandatory but if you reuse the same pattern multiple
     * times, this will make it more efficient.
     *
     * @param {Array|String} pattern
     * @return {Array}
     */
    compileMatchPattern: function (pattern) {
        return _gpfPathMatchCompilePatterns(pattern);
    }

};

