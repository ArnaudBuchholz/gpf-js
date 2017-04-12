/**
 * @file NodeJS File system implementation
 * @since 0.1.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_FS_TYPES*/ // File system types constants
/*global _GPF_HOST*/ // Host types
/*global _gpfCreateAbstractFunction*/ // Build a function that throws the abstractMethod exception
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfHost*/ // Host type
/*global _gpfNodeFs:true*/ // Node require("fs")
/*global _gpfNodePath*/ // Node require("path")
/*global _gpfPathNormalize*/ // Normalize path
/*global _gpfSetHostFileStorage*/ // Set the result of gpf.fs.getFileStorage
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
 * @since 0.1.9
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
 * @since 0.1.9
 */
var _gpfNodeFileStorage = _gpfDefine({
    $class: "gpf.node.FileStorage",

    constructor: function () {
        if (!_gpfNodeFs) {
            _gpfNodeFs = require("fs");
        }
    },

    //region IFileStorage

    /**
     * @inheritdoc gpf.interfaces.IFileStorage#getInfo
     * @since 0.1.9
     */
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
                                filePath: _gpfPathNormalize(_gpfNodePath.resolve(path)),
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

    },

    "openTextStream": _gpfCreateAbstractFunction(2),
    "close": _gpfCreateAbstractFunction(1),
    "explore": _gpfCreateAbstractFunction(1),
    "createDirectory": _gpfCreateAbstractFunction(1),
    "deleteFile": _gpfCreateAbstractFunction(1),
    "deleteDirectory": _gpfCreateAbstractFunction(1)

    //endregion

});

if (_GPF_HOST.NODEJS === _gpfHost) {

    _gpfSetHostFileStorage(new _gpfNodeFileStorage());

}
