/*#ifndef(UMD)*/
"use strict";
/*global _GPF_EVENT_ERROR*/ // gpf.events.EVENT_ERROR
/*global _GPF_EVENT_READY*/ // gpf.events.EVENT_READY
/*global _GPF_FS_TYPE_DIRECTORY*/ // _GPF_FS_TYPE_DIRECTORY
/*global _GPF_FS_TYPE_FILE*/ // _GPF_FS_TYPE_FILE
/*global _GPF_FS_TYPE_NOT_FOUND*/ // _GPF_FS_TYPE_NOT_FOUND
/*global _GPF_FS_TYPE_UNKNOWN*/ // _GPF_FS_TYPE_UNKNOWN
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _gpfFsExploreEnumerator*/ // IFileStorage.explore helper
/*global _gpfInNode*/ // The current host is a nodeJS like
/*global _gpfNodeFs:true*/ // Node require("fs")
/*global _gpfNodePath*/ // Node require("path")
/*global _GpfNodeStream*/ // gpf.stream.Node
/*global _gpfPathNormalize*/ // Normalize path
/*#endif*/

/*jshint node:true*/
/*eslint-env node*/

/**
 * Helper to wrap node error
 *
 * @param {*} err
 * @param {gpf.events.Handler} eventsHandler
 */
function _gpfFireNodeError (err, eventsHandler) {
    _gpfEventsFire.apply(null, [_GPF_EVENT_ERROR, {error: err}, eventsHandler]);
}

/**
 * Generate one of the calls based on a method name
 *
 * @param {String} methodName
 * @return {Function]
 * @closure
 */
function _gpfGenFsCall(methodName) {
    return function (path, eventsHandler) {
        path = _gpfPathNormalize(path);
        _gpfNodeFs[methodName](path, function (err) {
            if (err) {
                _gpfFireNodeError(err, eventsHandler);
            } else {
                _gpfEventsFire.apply(null, [_GPF_EVENT_READY, {}, eventsHandler]);
            }
        });
    };
}

_gpfDefine("gpf.fs.NodeFileStorage", Object, {
    public: {

        constructor: function () {
            if (!_gpfNodeFs) {
                _gpfNodeFs = require("fs");
            }
        },

        //region IFileStorage

        // @inheritdoc IFileStorage#getInfo
        getInfo: function (path, eventsHandler) {
            path = _gpfPathNormalize(path);
            _gpfNodeFs.exists(path, function (exists) {
                if (exists) {
                    _gpfNodeFs.stat(path, function (err, stats) {
                        var result;
                        if (err) {
                            _gpfFireNodeError(err, eventsHandler);
                        } else {
                            result = {
                                fileName: _gpfNodePath.basename(path),
                                filePath: _gpfNodePath.resolve(path),
                                size: stats.size,
                                createdDateTime: stats.ctime,
                                modifiedDateTime: stats.mtime
                            };
                            if (stats.isDirectory()) {
                                result.type = _GPF_FS_TYPE_DIRECTORY;
                            } else if (stats.isFile()) {
                                result.type = _GPF_FS_TYPE_FILE;
                            } else {
                                result.type = _GPF_FS_TYPE_UNKNOWN;
                            }
                            _gpfEventsFire.apply(null, [
                                _GPF_EVENT_READY,
                                {
                                    info: result
                                },
                                eventsHandler
                            ]);
                        }
                    });
                } else {
                    _gpfEventsFire.apply(null, [
                        _GPF_EVENT_READY,
                        {
                            info: {
                                type: _GPF_FS_TYPE_NOT_FOUND
                            }
                        },
                        eventsHandler
                    ]);
                }
            });
        },

        /**
         * @inheritdoc IFileStorage#readAsBinaryStream
         */
        readAsBinaryStream: function (path, eventsHandler) {
            // TODO handle error
            path = _gpfPathNormalize(path);
            var nodeStream = _gpfNodeFs.createReadStream(path);
            _gpfEventsFire.apply(null, [
                _GPF_EVENT_READY,
                {
                    stream: new gpf.node.ReadableStream(nodeStream)
                },
                eventsHandler
            ]);
        },

        /**
         * @inheritdoc IFileStorage#writeAsBinaryStream
         */
        writeAsBinaryStream: function (path, eventsHandler) {
            // TODO handle error
            path = _gpfPathNormalize(path);
            var nodeStream = _gpfNodeFs.createWriteStream(path);
            _gpfEventsFire.apply(null, [
                _GPF_EVENT_READY,
                {
                    stream: new gpf.node.WritableStream(nodeStream)
                },
                eventsHandler
            ]);
        },

        /**
         * @inheritdoc IFileStorage#close
         */
        close: function (stream, eventsHandler) {
            if (stream instanceof _GpfNodeStream) {
                stream.close(eventsHandler);
            } else {
                throw gpf.Error.invalidParameter();
            }
        },

        /**
         * @inheritdoc IFileStorage#explore
         */
        explore: function (path, eventsHandler) {
            var me = this;
            path = _gpfPathNormalize(path);
            _gpfNodeFs.readdir(path, function (err, files) {
                if (err) {
                    _gpfFireNodeError(err, eventsHandler);
                    return;
                }
                _gpfEventsFire.apply(null, [
                    _GPF_EVENT_READY,
                    {
                        enumerator: _gpfFsExploreEnumerator(me, files)
                    },
                    eventsHandler
                ]);
            });
        },

        /**
         * @inheritdoc IFileStorage#createFolder
         */
        createFolder: _gpfGenFsCall("mkdir"),

        /**
         * @inheritdoc IFileStorage#deleteFile
         */
        deleteFile: _gpfGenFsCall("unlink"),

        /**
         * @inheritdoc IFileStorage#deleteFolder
         */
        deleteFolder: _gpfGenFsCall("rmdir")

        //endregion

    }

});

var
    // @type {gpf.fs.NodeFileStorage}
    _gpfNodeFileStorage;

if (_gpfInNode) {

    /**
     * @inheritdoc gpf.fs#host
     * NodeJS version
     */
    gpf.fs.host = function () {
        if (!_gpfNodeFileStorage) {
            _gpfNodeFileStorage = new gpf.fs.NodeFileStorage();
        }
        return _gpfNodeFileStorage;
    };

}
