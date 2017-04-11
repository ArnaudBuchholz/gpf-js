/**
 * @file Path helper
 */
/*#ifndef(UMD)*/
"use strict";
/*exported _gpfPathDecompose*/ // Normalize path and returns an array of parts
/*exported _gpfPathNormalize*/ // Normalize path
/*#endif*/

//region _gpfPathDecompose

function _gpfPathSplit (path) {
    if (-1 < path.indexOf("\\")) {
        // DOS path is case insensitive, hence lowercase it
        return path.toLowerCase().split("\\");
    }
    // Assuming a Unix-like path
    return path.split("/");
}

function _gpfPathSafeRemoveTrailingBlank (splitPath) {
    if (!splitPath[splitPath.length - 1]) {
        splitPath.pop();
    }
}

function _gpfPathRemoveTrailingBlank (splitPath) {
    if (splitPath.length) {
        _gpfPathSafeRemoveTrailingBlank(splitPath);
    }
}

/**
 * Normalize paths and returns an array of parts.
 * If a DOS-like path is detected (use of \), it is lower-cased
 *
 * @param {String} path Path to normalize
 * @return {String[]} Normalized path represented as an array of parts
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
 */
function _gpfPathNormalize (path) {
    return _gpfPathDecompose(path).join("/");
}

/**
 * Get the last name of a path
 *
 * @param {String} path Path to analyze
 * @return {String} Name
 */
function _gpfPathName (path) {
    return _gpfPathDecompose(path).pop();
}

function _gpfPathAppend (splitPath, relativePath) {
    var relativeSplitPath = _gpfPathDecompose(relativePath);
    while (".." === relativeSplitPath[0]) {
        relativeSplitPath.shift();
        if (undefined === splitPath.pop()) {
            return; // does not resolve on unknown parent
        }
    }
    [].push.apply(splitPath, relativeSplitPath);
}

/**
 * Join all arguments together and normalize the resulting path
 *
 * @param {String} path Base path
 * @param {...String} relativePath Relative parts to append to the base path
 * @return {String} Joined path
 */
function _gpfPathJoin (path) {
    var splitPath = _gpfPathDecompose(path);
    [].slice.call(arguments, 1).forEach(_gpfPathAppend.bind(null, splitPath));
    return splitPath.join("/");
}

function _gpfPathSafeShiftIdenticalBeginning (splitFromPath, splitToPath) {
    while (splitFromPath[0] === splitToPath[0]) {
        splitFromPath.shift();
        splitToPath.shift();
    }
}

function _gpfPathShiftIdenticalBeginning (splitFromPath, splitToPath) {
    if (splitFromPath.length && splitToPath.length) {
        _gpfPathSafeShiftIdenticalBeginning(splitFromPath, splitToPath);
    }
}

/**
 * Solve the relative path from from to to
 *
 * @param {String} from From path
 * @param {String} to To path
 * @return {String} Relative path
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

gpf.path = {

    /** @gpf:sameas _gpfPathJoin */
    join: _gpfPathJoin,

    /**
     * Get the parent of a path
     *
     * @param {String} path Path to analyze
     * @return {String} Parent path
     */
    parent: function (path) {
        path = _gpfPathDecompose(path);
        path.pop();
        return path.join("/");
    },

    /** @gpf:sameas _gpfPathName */
    name: _gpfPathName,

    /**
     * Get the last name of a path without the extension
     *
     * @param {String} path Path to analyze
     * @return {String} Name without the extension
     */
    nameOnly: function (path) {
        var name = _gpfPathName(path),
            pos = name.lastIndexOf(".");
        if (-1 === pos) {
            return name;
        }
        return name.substr(0, pos);
    },

    /**
     * Get the extension of the last name of a path (including dot)
     *
     * @param {String} path Path to analyze
     * @return {String} Extension (including dot)
     */
    extension: function (path) {
        var name = _gpfPathName(path),
            pos = name.lastIndexOf(".");
        if (-1 === pos) {
            return "";
        }
        return name.substr(pos);
    },

    /** @gpf:sameas _gpfPathRelative*/
    relative: _gpfPathRelative

};

/*#ifndef(UMD)*/

gpf.internals._gpfPathNormalize = _gpfPathNormalize;

/*#endif*/
