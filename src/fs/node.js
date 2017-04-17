/**
 * @file NodeJS File system implementation
 * @since 0.1.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_FS_TYPES*/ // File system types constants
/*global _GPF_HOST*/ // Host types
/*global _GPF_FS_OPENFOR*/
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

function _gpfFsNodeOpenTextStreamForReading (path) {
    return new gpf.node.ReadableStream(_gpfNodeFs.createReadStream(path, {
        flags: "r",
        autoClose: true
    }));
}

function _gpfFsNodeOpenTextStreamForAppending (path) {
    return new gpf.node.WritableStream(_gpfNodeFs.createWriteStream(path, {
        flags: "w+",
        autoClose: true
    }));
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
        /* istanbul ignore next */ // Because boot always implies require("fs")
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
                            /* istanbul ignore else */ // Because unknown type can't be tested
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

    /** @inheritdoc */
    openTextStream: function (path, mode) {
        if (_GPF_FS_OPENFOR.READING === mode) {
            return _gpfFsNodeOpenTextStreamForReading(path);
        }
        return _gpfFsNodeOpenTextStreamForAppending(path);
    },

    /** @inheritdoc */
    close: function (stream) {
        if (stream instanceof gpf.node.BaseStream) {
            stream.close();
        } else {
            gpf.error.incompatibleStream();
        }
    },

    "explore": _gpfCreateAbstractFunction(1),
    "createDirectory": _gpfCreateAbstractFunction(1),
    "deleteFile": _gpfCreateAbstractFunction(1),
    "deleteDirectory": _gpfCreateAbstractFunction(1)

    //endregion

});

/* istanbul ignore else */ // Because tested with NodeJS
if (_GPF_HOST.NODEJS === _gpfHost) {

    _gpfSetHostFileStorage(new _gpfNodeFileStorage());

}
