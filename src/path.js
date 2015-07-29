/*#ifndef(UMD)*/
"use strict";
/*exported _gpfPathDecompose*/
/*exported _gpfPathNormalize*/
/*#endif*/

var
    /**
     * Normalize paths and returns an array of parts
     * If a DOS-like path is detected (use of \), it is lower-cased
     *
     * @param {String} path
     * @return {String[]}
     * @private
     */
    _gpfPathDecompose = function (path) {
        // Split on separator
        if (-1 < path.indexOf("/")) {
            path = path.split("/");
        } else if (-1 < path.indexOf("\\")) {
            // DOS path is case insensitive, hence lowercase it
            path = path.toLowerCase().split("\\");
        } else {
            // TODO what about _gpfDosPath?
            return [path];
        }
        // Remove trailing /
        if (path.length && !path[path.length - 1]) {
            path.pop();
        }
        return path;
    },

    /**
     * Normalize path
     *
     * @param {String} path
     * @return {string}
     * @private
     */
    _gpfPathNormalize = function (path) {
        return _gpfPathDecompose(path).join("/");
    },

    /**
     * Get the last name of a path
     *
     * @param {String} path
     * @return {String}
     * @private
     */
    _gpfPathName = function (path) {
        path = _gpfPathDecompose(path);
        return path[path.length - 1];
    };

gpf.path = {

    /**
     * Join all arguments together and normalize the resulting path
     *
     * @param {String} path
     * @param {String*} var_args
     */
    join: function (path) {
        path = _gpfPathDecompose(path);
        var idx,
            len = arguments.length,
            relativePath;
        for (idx = 1; idx < len; ++idx) {
            relativePath = _gpfPathDecompose(arguments[idx]);
            while (relativePath[0] === "..") {
                relativePath.shift();
                if (path.length) {
                    path.pop();
                } else {
                    return "";
                }
            }
            if (relativePath.length) {
                path = path.concat(relativePath);
            }
        }
        return path.join("/");
    },

    /**
     * Get the parent of a path
     *
     * @param {String} path
     * @return {String}
     */
    parent: function (path) {
        path = _gpfPathDecompose(path);
        if (path.length) {
            path.pop();
            return path.join("/");
        }
        return "";
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

    /**
     * Solve the relative path from from to to
     *
     * @param {String} from
     * @param {String} to
     */
    relative: function (from, to) {
        from = _gpfPathDecompose(from);
        to = _gpfPathDecompose(to);
        var length;
        // First remove identical part
        while (from.length && to.length && from[0] === to[0]) {
            from.shift();
            to.shift();
        }
        // For each remaining part in from, unshift .. in to
        length = from.length + 1;
        while (--length) {
            to.unshift("..");
        }
        return to.join("/");
    }

};