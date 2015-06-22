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
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfInNode*/ // The current host is a nodeJS like
/*global _gpfNodeFs:true*/ // Node require("fs")
/*global _gpfNodePath*/ // Node require("path")
/*#endif*/

var
    /**
     * Helper to wrap node error
     *
     * @param {*} err
     * @param {gpf.events.Handler} eventsHandler
     * @private
     */
    _gpfFireNodeError = function (err, eventsHandler) {
        _gpfEventsFire.apply(null, [
            _GPF_EVENT_ERROR,
            {
                error: err
            },
            eventsHandler
        ]);
    },

    /**
     * @type {gpf.fs.NodeFileStorage}
     * @private
     */
    _gpfNodeFileStorage;

_gpfDefine("gpf.fs.NodeFileStorage", {

    public: {

        constructor: function () {
            if (!_gpfNodeFs) {
                _gpfNodeFs = require("fs");
            }
        },

        //region IFileStorage

        /**
         * @inheritdoc IFileStorage:getInfo
         */
        getInfo: function (path, eventsHandler) {
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
         * @inheritdoc IFileStorage:readAsBinaryStream
         */
        readAsBinaryStream: function (path, eventsHandler) {
            // TODO handle error
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
         * @inheritdoc IFileStorage:writeAsBinaryStream
         */
        writeAsBinaryStream: function (path, eventsHandler) {
            // TODO handle error
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
         * @inheritdoc IFileStorage:close
         */
        close: function (stream) {

            _gpfIgnore(stream);
            // TODO not sure what I should do with it...
        },

        /**
         * @inheritdoc IFileStorage:explore
         */
        explore: function (path, eventsHandler) {
            _gpfIgnore(path);
            _gpfIgnore(eventsHandler);
            // use _gpfNodeFs.readdir
        },

        /**
         * @inheritdoc IFileStorage:createFolder
         */
        createFolder: function (path, eventsHandler) {
            _gpfIgnore(path);
            _gpfIgnore(eventsHandler);
        },

        /**
         * @inheritdoc IFileStorage:deleteFile
         */
        deleteFile: function (path, eventsHandler) {
            _gpfIgnore(path);
            _gpfIgnore(eventsHandler);
        },

        /**
         * @inheritdoc IFileStorage:deleteFolder
         */
        deleteFolder: function (path, eventsHandler) {
            _gpfIgnore(path);
            _gpfIgnore(eventsHandler);
        }

        //endregion

    }

});

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