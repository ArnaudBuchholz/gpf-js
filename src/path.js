/**
 * @file Path helper
 * @since 0.1.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_NOT_FOUND*/ // -1
/*global _gpfArrayForEach*/ // Almost like [].forEach (undefined are also enumerated)
/*global _gpfArrayTail*/ // [].slice.call(,1)
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*exported _gpfPathDecompose*/ // Normalize path and returns an array of parts
/*exported _gpfPathExtension*/ // Get the extension of the last name of a path (including dot)
/*exported _gpfPathJoin*/ // Join all arguments together and normalize the resulting path
/*exported _gpfPathNormalize*/ // Normalize path
/*exported _gpfPathParent*/ // Get the parent of a path
/*#endif*/

_gpfErrorDeclare("path", {

    /**
     * ### Summary
     *
     * Unreachable path
     *
     * ### Description
     *
     * This error is triggered when trying to get the parent of a root path using gpf.path.parent or
     * gpf.path.join with ..
     * @see gpf.path.join
     * @see gpf.path.parent
     * @since 0.1.9
     */
    unreachablePath:
        "Unreachable path"
});

//region _gpfPathDecompose

function _gpfPathSplit (path) {
    if (path.includes("\\")) {
        // DOS path is case insensitive, hence lowercase it
        return path.toLowerCase().split("\\");
    }
    // Assuming a Unix-like path
    return path.split("/");
}

function _gpfPathRemoveTrailingBlank (splitPath) {
    if (!splitPath[splitPath.length - 1]) {
        splitPath.pop();
    }
}

function _gpfPathUp (splitPath) {
    if (splitPath.length) {
        splitPath.pop();
    } else {
        gpf.Error.unreachablePath();
    }
}

/**
 * Normalize paths and returns an array of parts.
 * If a DOS-like path is detected (use of \), it is lower-cased
 *
 * @param {String} path Path to normalize
 * @return {String[]} Normalized path represented as an array of parts
 * @since 0.1.9
 */
function _gpfPathDecompose (path) {
    var splitPath = _gpfPathSplit(path);
    _gpfPathRemoveTrailingBlank(splitPath);
    return splitPath;
}

//endregion

/**
 * Normalize path
 *
 * @param {String} path Path to normalize
 * @return {String} Normalized path
 * @since 0.1.9
 */
function _gpfPathNormalize (path) {
    return _gpfPathDecompose(path).join("/");
}

/**
 * Get the last name of a path
 *
 * @param {String} path Path to analyze
 * @return {String} Name
 * @since 0.1.9
 */
function _gpfPathName (path) {
    if (path) {
        return _gpfPathDecompose(path).pop();
    }
    return "";
}

/**
 * Get the extension of the last name of a path (including dot)
 *
 * @param {String} path Path to analyze
 * @return {String} Extension (including dot)
 * @since 0.1.9
 */
function _gpfPathExtension (path) {
    var name = _gpfPathName(path),
        pos = name.lastIndexOf(".");
    if (pos === _GPF_NOT_FOUND) {
        return "";
    }
    return name.substr(pos);
}

var _gpfPathAppendPatterns = {

    "": function (splitPath) {
        splitPath.length = 0;
        splitPath.push(""); // Will start with /
    },

    ".": _gpfEmptyFunc,

    "..": function (splitPath) {
        _gpfPathUp(splitPath);
    }

};

function _gpfPathAppend (splitPath, relativePath) {
    _gpfArrayForEach(_gpfPathDecompose(relativePath), function (relativeItem) {
        var pattern = _gpfPathAppendPatterns[relativeItem];
        if (pattern) {
            pattern(splitPath);
        } else {
            splitPath.push(relativeItem);
        }
    });
}

/**
 * Join all arguments together and normalize the resulting path
 *
 * @param {String} path Base path
 * @param {...String} relativePath Relative parts to append to the base path
 * @return {String} Joined path
 * @throws {gpf.Error.UnreachablePath}
 * @since 0.1.9
 */
function _gpfPathJoin (path) {
    var splitPath = _gpfPathDecompose(path);
    _gpfArrayTail(arguments).forEach(_gpfPathAppend.bind(null, splitPath));
    return splitPath.join("/");
}

function _gpfPathSafeShiftIdenticalBeginning (splitFromPath, splitToPath) {
    while (splitFromPath[0] === splitToPath[0]) {
        splitFromPath.shift();
        splitToPath.shift();
    }
}

function _gpfPathShiftIdenticalBeginning (splitFromPath, splitToPath) {
    if (splitFromPath.length * splitToPath.length) { // equivalent to splitFromPath.length && splitToPath.length
        _gpfPathSafeShiftIdenticalBeginning(splitFromPath, splitToPath);
    }
}

/**
 * Get the parent of a path
 *
 * @param {String} path Path to analyze
 * @return {String} Parent path
 * @throws {gpf.Error.UnreachablePath}
 * @since 0.1.9
 */
function _gpfPathParent (path) {
    var splitPath = _gpfPathDecompose(path);
    _gpfPathUp(splitPath);
    return splitPath.join("/");
}

/**
 * Solve the relative path from from to to
 *
 * @param {String} from From path
 * @param {String} to To path
 * @return {String} Relative path
 * @since 0.1.9
 */
function _gpfPathRelative (from, to) {
    var length,
        splitFrom = _gpfPathDecompose(from),
        splitTo = _gpfPathDecompose(to);
    _gpfPathShiftIdenticalBeginning(splitFrom, splitTo);
    // For each remaining part in from, unshift .. in to
    length = splitFrom.length + 1;
    while (--length) {
        splitTo.unshift("..");
    }
    return splitTo.join("/");
}

/**
 * @namespace gpf.path
 * @description Root namespace for path manipulation.
 *
 * As the library works with several hosts (Windows and Unix-like, see {@tutorial LOADING}),
 * the API accepts any kind of [path separator](https://en.wikipedia.org/wiki/Path_%28computing%29).
 * However, they can't be mixed.
 *
 * When giving a path, the rule is:
 * - If the path contains at least one \, it is considered a Windows one
 * - Otherwise, the path is considered a Unix one
 *
 * On the other hand, all path returned by the API are using the Unix-like formalism.
 *
 * @since 0.1.9
 */
gpf.path = {

    /**
     * @gpf:sameas _gpfPathJoin
     * @since 0.1.9
     */
    join: _gpfPathJoin,

    /**
     * @gpf:sameas _gpfPathParent
     * @since 0.1.9
     */
    parent: _gpfPathParent,

    /**
     * @gpf:sameas _gpfPathName
     * @since 0.1.9
     */
    name: _gpfPathName,

    /**
     * Get the last name of a path without the extension
     *
     * @param {String} path Path to analyze
     * @return {String} Name without the extension
     * @since 0.1.9
     */
    nameOnly: function (path) {
        var name = _gpfPathName(path),
            pos = name.lastIndexOf(".");
        if (pos === _GPF_NOT_FOUND) {
            return name;
        }
        return name.substr(0, pos);
    },

    /**
     * @gpf:sameas _gpfPathExtension
     * @since 0.1.9
     */
    extension: _gpfPathExtension,

    /**
     * @gpf:sameas _gpfPathRelative
     * @since 0.1.9
     */
    relative: _gpfPathRelative

};

/*#ifndef(UMD)*/

gpf.internals._gpfPathNormalize = _gpfPathNormalize;

/*#endif*/
