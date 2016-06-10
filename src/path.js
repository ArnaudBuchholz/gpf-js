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

function _gpfPathRemoveTrailingBlank (splitPath) {
    if (splitPath.length && !splitPath[splitPath.length - 1]) {
        splitPath.pop();
    }
}

/**
 * Normalize paths and returns an array of parts.
 * If a DOS-like path is detected (use of \), it is lower-cased
 *
 * @param {String} path
 * @return {String[]}
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
 * @param {String} path
 * @return {string}
 */
function _gpfPathNormalize (path) {
    return _gpfPathDecompose(path).join("/");
}

/**
 * Get the last name of a path
 *
 * @param {String} path
 * @return {String}
 */
function _gpfPathName (path) {
    path = _gpfPathDecompose(path);
    return path[path.length - 1];
}

/**
 * Join all arguments together and normalize the resulting path
 *
 * @param {String} path
 * @param {...String} relativePath
 */
function _gpfPathJoin (path) {
    var splitPath = _gpfPathDecompose(path);
    [].slice.call(arguments, 1).forEach(function (relativePath) {
        var relativeSplitPath = _gpfPathDecompose(relativePath);
        while (".." === relativeSplitPath[0]) {
            relativeSplitPath.shift();
            if (undefined === splitPath.pop()) {
                return; // does not resolve on unknown parent
            }
        }
        [].push.apply(splitPath, relativeSplitPath);
    });
    return splitPath.join("/");
}

function _gpfPathShiftIdenticalBeginning (splitFromPath, splitToPath) {
    while (splitFromPath.length && splitToPath.length && splitFromPath[0] === splitToPath[0]) {
        splitFromPath.shift();
        splitToPath.shift();
    }
}

/**
 * Solve the relative path from from to to
 *
 * @param {String} from
 * @param {String} to
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

    // @inheritdoc _gpfPathJoin
    join: _gpfPathJoin,

    /**
     * Get the parent of a path
     *
     * @param {String} path
     * @return {String}
     */
    parent: function (path) {
        path = _gpfPathDecompose(path);
        path.pop();
        return path.join("/");
    },

    /**
     * Get the last name of a path
     *
     * @param {String} path
     * @return {String}
     */
    name: _gpfPathName,

    /**
     * Get the last name of a path without the extension
     *
     * @param {String} path
     * @return {String}
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
     * @param {String} path
     * @return {String}
     */
    extension: function (path) {
        var name = _gpfPathName(path),
            pos = name.lastIndexOf(".");
        if (-1 === pos) {
            return "";
        }
        return name.substr(pos);
    },

    // @inheritdoc @_gpfPathRelative
    relative: _gpfPathRelative

};

/*#ifndef(UMD)*/

gpf.internals._gpfPathNormalize = _gpfPathNormalize;

/*#endif*/
