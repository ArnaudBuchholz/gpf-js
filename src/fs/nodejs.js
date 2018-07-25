/**
 * @file NodeJS File system implementation
 * @since 0.1.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_FS_OPENFOR*/ // File system stream opening mode
/*global _GPF_FS_TYPES*/ // File system types constants
/*global _GPF_HOST*/ // Host types
/*global _GpfNodeBaseStream*/ // gpf.node.BaseStream
/*global _GpfNodeReadableStream*/ // gpf.node.ReadableStream
/*global _GpfNodeWritableStream*/ // gpf.node.WritableStream
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfFsCloseBuild*/ // Build close method that assess the stream type
/*global _gpfFsExploreEnumerator*/ // IFileStorage.explore helper
/*global _gpfFsSetFileStorageIf*/ // Set the file storage implementation if the host matches
/*global _gpfNodeFs*/ // Node/PhantomJS require("fs")
/*global _gpfNodePath*/ // Node require("path")
/*global _gpfPathJoin*/ // Join all arguments together and normalize the resulting path
/*global _gpfPathNormalize*/ // Normalize path
/*#endif*/

/*jshint node:true*/
/*eslint-env node*/

/*eslint-ignore no-unused-vars*/

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
        GpfStream: _GpfNodeReadableStream,
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
        GpfStream: _GpfNodeWritableStream,
        nodeStream: "createWriteStream"
    });
}

function _gpfFsNodeGetFileType (stats) {
    if (stats.isFile()) {
        return _GPF_FS_TYPES.FILE;
    }
    return _GPF_FS_TYPES.UNKNOWN;
}

function _gpfFsNodeGetType (stats) {
    if (stats.isDirectory()) {
        return _GPF_FS_TYPES.DIRECTORY;
    }
    return _gpfFsNodeGetFileType(stats);
}

/**
 * NodeJS specific IFileStorage implementation
 *
 * @class gpf.node.FileStorage
 * @implements {gpf.interfaces.IFileStorage}
 * @private
 * @since 0.1.9
 */
var _GpfNodeFileStorage = _gpfDefine({
    $class: "gpf.node.FileStorage",

    //region gpf.interfaces.IFileStorage

    /**
     * @gpf:sameas gpf.interfaces.IFileStorage#getInfo
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
                            return {
                                fileName: _gpfNodePath.basename(path),
                                filePath: _gpfPathNormalize(_gpfNodePath.resolve(path)),
                                size: stats.size,
                                createdDateTime: stats.ctime,
                                modifiedDateTime: stats.mtime,
                                type: _gpfFsNodeGetType(stats)
                            };
                        });
                }
                return {
                    type: _GPF_FS_TYPES.NOT_FOUND
                };
            });

    },

    /**
     * @gpf:sameas gpf.interfaces.IFileStorage#openTextStream
     * @since 0.1.9
     */
    openTextStream: function (path, mode) {
        if (_GPF_FS_OPENFOR.READING === mode) {
            return _gpfFsNodeOpenTextStreamForReading(path);
        }
        return _gpfFsNodeOpenTextStreamForAppending(path);
    },

    /**
     * @gpf:sameas gpf.interfaces.IFileStorage#close
     * @since 0.1.9
     */
    close: _gpfFsCloseBuild(_GpfNodeBaseStream),

    /**
     * @gpf:sameas gpf.interfaces.IFileStorage#explore
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
     * @gpf:sameas gpf.interfaces.IFileStorage#createDirectory
     * @since 0.1.9
     */
    createDirectory: _gpfFsNodeFsCallWithPath.bind(null, "mkdir"),

    /**
     * @gpf:sameas gpf.interfaces.IFileStorage#deleteFile
     * @since 0.1.9
     */
    deleteFile: _gpfFsNodeFsCallWithPath.bind(null, "unlink"),

    /**
     * @gpf:sameas gpf.interfaces.IFileStorage#deleteDirectory
     * @since 0.1.9
     */
    deleteDirectory: _gpfFsNodeFsCallWithPath.bind(null, "rmdir")

    //endregion

});

_gpfFsSetFileStorageIf(_GPF_HOST.NODEJS, _GpfNodeFileStorage);

/*#ifndef(UMD)*/

gpf.internals._gpfFsNodeGetType = _gpfFsNodeGetType;

/*#endif*/
