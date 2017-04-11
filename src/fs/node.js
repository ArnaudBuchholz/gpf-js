/**
 * @file NodeJS File system implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_FS_TYPES*/ // File system types constants
/*global _GPF_HOST*/
/*global _gpfHost*/
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfNodeFs:true*/ // Node require("fs")
/*global _gpfNodePath*/ // Node require("path")
/*global _gpfPathNormalize*/ // Normalize path
/*global _gpfSetHostFileStorage*/
/*#endif*/

/*jshint node:true*/
/*eslint-env node*/

/**
 * Encapsulate fs API inside a Promise
 *
 * @param {String} methodName fs method name
 * @param {String} path fs method name
 * @return {Promise<*>} Resolved with API result
 * @gpf:closure
 */
function _gpfFsNodeFsCall (methodName, path) {
    path = _gpfPathNormalize(path);
    return new Promise(function (resolve, reject) {
        _gpfNodeFs[methodName](path, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}


/**
 * NodeJS specific IFileStorage implementation
 *
 * @class {gpf.node.FileStorage}
 * @implements {gpf.interfaces.IFileStorage}
 */
var _gpfNodeFileStorage = _gpfDefine({
    $class: "gpf.node.FileStorage",

    constructor: function () {
        if (!_gpfNodeFs) {
            _gpfNodeFs = require("fs");
        }
    },

    //region IFileStorage

    /** @inheritdoc gpf.interfaces.IFileStorage#getInfo */
    getInfo: function (path) {
        path = _gpfPathNormalize(path);
        return new Promise(function (resolve) {
            _gpfNodeFs.exists(path, resolve);
        })
            .then(function (exists) {
                if (exists) {
                    return _gpfFsNodeFsCall("stat", path)
                        .then(function (stats) {
                            var info = {
                                fileName: _gpfNodePath.basename(path),
                                filePath: _gpfNodePath.resolve(path),
                                size: stats.size,
                                createdDateTime: stats.ctime,
                                modifiedDateTime: stats.mtime
                            };
                            if (stats.isDirectory()) {
                                info.type = _GPF_FS_TYPES.DIRECTORY;
                            } else if (stats.isFile()) {
                                info.type = _GPF_FS_TYPES.FILE;
                            } else {
                                info.type = _GPF_FS_TYPES.UNKNOWN;
                            }
                            return info;
                        });
                }
                return {
                    type: _GPF_FS_TYPES.NOT_FOUND
                };
            });

    }

    //endregion

});

if (_GPF_HOST.NODEJS === _gpfHost) {

    _gpfSetHostFileStorage(new _gpfNodeFileStorage());

}
