/*#ifndef(UMD)*/
"use strict";
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _GPF_FS_TYPE_NOT_FOUND*/ // _GPF_FS_TYPE_NOT_FOUND
/*global _GPF_FS_TYPE_FILE*/ // _GPF_FS_TYPE_FILE
/*global _GPF_FS_TYPE_DIRECTORY*/ // _GPF_FS_TYPE_DIRECTORY
/*global _GPF_FS_TYPE_UNKNOWN*/ // _GPF_FS_TYPE_UNKNOWN
/*global _gpfInNode*/ // The current host is a nodeJS like
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _GPF_EVENT_ERROR*/ // gpf.events.EVENT_ERROR
/*global _GPF_EVENT_READY*/ // gpf.events.EVENT_READY
/*#endif*/

if (_gpfInNode) {

    var _fs,
        _getNodeFS = function () {
            if (undefined === _fs) {
                _fs = require("fs");
            }
            return _fs;
        },
        _fireNodeError = function (err, eventsHandler) {
            _gpfEventsFire.apply(null, [
                _GPF_EVENT_ERROR,
                {
                    error: err
                },
                eventsHandler
            ]);
        };

    gpf.fs.getInfo = function (path, eventsHandler) {
        _getNodeFS().exists(path, function (exists) {
            if (exists) {
                _getNodeFS().stat(path, function (err, stats) {
                    var result;
                    if (err) {
                        _fireNodeError(err, eventsHandler);
                    } else {
                        result = {
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
    };

    gpf.fs.readAsBinaryStream = function (path, eventsHandler) {
        // TODO handle error
        var nodeStream = _getNodeFS().createReadStream(path);
        _gpfEventsFire.apply(null, [
            _GPF_EVENT_READY,
            {
                stream: new gpf.node.ReadableStream(nodeStream)
            },
            eventsHandler
        ]);
    };

    gpf.fs.writeAsBinaryStream = function (path, eventsHandler) {
        // TODO handle error
        var nodeStream = _getNodeFS().createWriteStream(path);
        _gpfEventsFire.apply(null, [
            _GPF_EVENT_READY,
            {
                stream: new gpf.node.WritableStream(nodeStream)
            },
            eventsHandler
        ]);
    };

    gpf.fs.close = function (stream) {
        _gpfIgnore(stream);
        // TODO not sure what I should do with it...
    };

}