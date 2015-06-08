/*#ifndef(UMD)*/
"use strict";
/*global _gpfDosPath*/ // DOS-like path
/*#endif*/

var
    /**
     * Normalize paths:
     * - on DOS path environment, it is lowercased
     * - if any DOS separator found, it is replaced with a UNIX one
     *
     * @param {String} path
     * @returns {String}
     * @private
     */
    _gpfPathNormalize = function (path) {
        if (_gpfDosPath) {
            path = path.toLowerCase();
        }
        if (-1 < path.indexOf("\\")) {
            return path.toLowerCase().split("\\").join("/");
        }
    },

    /**
     * Get the parent of a path
     *
     * @param {String} path expects a normalized path
     * @returns {String}
     * @private
     */
    _gpfPathParent = function (path) {
        var parts = path.split("/");
        parts.pop();
        return parts.join("/");
    };

gpf.path = {

    /**
     * Join all arguments together and normalize the resulting path
     *
     * @param {String} path
     * @param {String*} var_args
     */
    join: function (path) {
        path = _gpfPathNormalize(path).split("/");
        var idx,
            len = arguments.length,
            relativePath;
        for (idx = 1; idx < len; ++idx) {
            relativePath = _gpfPathNormalize(arguments[idx]).split("/");
            while (relativePath[0] === "..") {
                relativePath.shift();
                path.pop();
            }
            if (relativePath.length) {

            }
        }
    },

    parent: function (path) {

    },

    name: function (path) {

    },

    nameOnly: function (path) {


    },

    extension: function (path) {

    }

};