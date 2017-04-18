/**
 * @file NodeJS File system implementation
 * @since 0.1.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_FS_OPENFOR*/ // File system stream opening mode
/*global _GPF_FS_TYPES*/ // File system types constants
/*global _GPF_HOST*/ // Host types
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfFsExploreEnumerator*/ // IFileStorage.explore helper
/*global _gpfHost*/ // Host type
/*global _gpfNodeFs:true*/ // Node require("fs")
/*global _gpfNodePath*/ // Node require("path")
/*global _gpfPathJoin*/ // Join all arguments together and normalize the resulting path
/*global _gpfPathNormalize*/ // Normalize path
/*global _gpfSetHostFileStorage*/ // Set the result of gpf.fs.getFileStorage
/*#endif*/

/*jshint node:true*/
/*eslint-env node*/

/**
 * Encapsulate fs API with a list of parameters inside a Promise
 *
 * @param {String} methodName fs method name
 * @param {Array} args Argument array
 * @return {Promise<*>} Resolved with API result
 * @gpf:closure
 * @since 0.1.9
 */
function _gpfFsNodeFsCall (methodName, args) {
    return new Promise(function (resolve, reject) {
        _gpfNodeFs[methodName].apply(_gpfNodeFs, args.concat([function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        }]));
    });
}

/**
 * Encapsulate fs API taking a path parameter inside a Promise
 *
 * @param {String} methodName fs method name
 * @param {String} path file path
 * @return {Promise<*>} Resolved with API result
 * @gpf:closure
 * @since 0.1.9
 */
function _gpfFsNodeFsCallWithPath (methodName, path) {
    return _gpfFsNodeFsCall(methodName, [_gpfPathNormalize(path)]);
}

function _gpfFsNodeOpenTextStream (path, options) {
    return _gpfFsNodeFsCall("open", [_gpfPathNormalize(path), options.flags])
        .then(function (fd) {
            return new options.GpfStream(_gpfNodeFs[options.nodeStream]("", {
                fd: fd,
                autoClose: false
            }), _gpfFsNodeFsCall.bind(null, "close", [fd]));
        });
}

/**
 * Open a text stream for reading
 *
 * @param {String} path File path
 * @return {Promise<gpf.interfaces.IReadableStream>} gpf.node.ReadableStream
 * @since 0.1.9
 */
function _gpfFsNodeOpenTextStreamForReading (path) {
    return _gpfFsNodeOpenTextStream(path, {
        flags: "r",
        GpfStream: gpf.node.ReadableStream,
        nodeStream: "createReadStream"
    });
}

/**
 * Open a text stream for appending
 *
 * @param {String} path File path
 * @return {Promise<gpf.interfaces.IWritableStream>} gpf.node.WritableStream
 * @since 0.1.9
 */
function _gpfFsNodeOpenTextStreamForAppending (path) {
    return _gpfFsNodeOpenTextStream(path, {
        flags: "a",
        GpfStream: gpf.node.WritableStream,
        nodeStream: "createWriteStream"
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
                    return _gpfFsNodeFsCallWithPath("stat", path)
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

    /**
     * @inheritdoc
     * @since 0.1.9
     */
    openTextStream: function (path, mode) {
        if (_GPF_FS_OPENFOR.READING === mode) {
            return _gpfFsNodeOpenTextStreamForReading(path);
        }
        return _gpfFsNodeOpenTextStreamForAppending(path);
    },

    /**
     * @inheritdoc
     * @since 0.1.9
     */
    close: function (stream) {
        if (stream instanceof gpf.node.BaseStream) {
            return stream.close();
        }
        return Promise.reject(new gpf.Error.IncompatibleStream());
    },

    /**
     * @inheritdoc
     * @since 0.1.9
     */
    explore: function (path) {
        var me = this;
        return _gpfFsNodeFsCallWithPath("readdir", path)
            .then(function (content) {
                return _gpfFsExploreEnumerator(me, content.map(function (name) {
                    return _gpfPathJoin(path, name);
                }));
            });
    },

    /**
     * @inheritdoc
     * @since 0.1.9
     */
    createDirectory: _gpfFsNodeFsCallWithPath.bind(null, "mkdir"),

    /**
     * @inheritdoc
     * @since 0.1.9
     */
    deleteFile: _gpfFsNodeFsCallWithPath.bind(null, "unlink"),

    /**
     * @inheritdoc
     * @since 0.1.9
     */
    deleteDirectory: _gpfFsNodeFsCallWithPath.bind(null, "rmdir")

    //endregion

});

/* istanbul ignore else */ // Because tested with NodeJS
if (_GPF_HOST.NODEJS === _gpfHost) {

    _gpfSetHostFileStorage(new _gpfNodeFileStorage());

}
