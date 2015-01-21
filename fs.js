/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    gpf.fs = {

        TYPE_NOT_FOUND: 0,
        TYPE_FILE: 1,
        TYPE_DIRECTORY: 2,
        TYPE_UNKNOWN: 99,

        /**
         * Get information on the provided file path
         *
         * @param {*} path
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready
         * @eventParam {Object} info contains:
         * - type {Number} see gpf.fs.TYPE_xxx
         * - size {Number}
         * - createdDateTime
         * - modifiedDateTime
         */
        getInfo: function (path, eventsHandler) {
            gpf.interfaces.ignoreParameter(path);
            gpf.interfaces.ignoreParameter(eventsHandler);
            gpf.Error.Abstract();
        },

        /**
         * Read as a binary stream
         *
         * @param {*} path
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready
         * @eventParam {gpf.interface.IReadableStream} stream
         */
        readAsBinaryStream: function (path, eventsHandler) {
            gpf.interfaces.ignoreParameter(path);
            gpf.interfaces.ignoreParameter(eventsHandler);
            gpf.Error.Abstract();
        },

        /**
         * Write as a binary stream (overwrite file if it exists)
         *
         * @param {*} path
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready
         * @eventParam {gpf.interface.IWritableStream} stream
         */
        writeAsBinaryStream: function (path, eventsHandler) {
            gpf.interfaces.ignoreParameter(path);
            gpf.interfaces.ignoreParameter(eventsHandler);
            gpf.Error.Abstract();
        },

        /**
         * Close the underlying file: the stream becomes unusable
         *
         * @param {gpf.interfaces.IReadableStream|
         * gpf.interfaces.IWritableStream} stream
         */
        close: function (stream) {
            gpf.interfaces.ignoreParameter(stream);
            gpf.Error.Abstract();
        }

    };

    if (gpf.node) {

        var _fs,
            _getNodeFS = function () {
                if (undefined === _fs) {
                    _fs = require("fs");
                }
                return _fs;
            },
            _fireNodeError = function (err, eventsHandler) {
                gpf.events.fire("error", {
                    error: err
                }, eventsHandler);
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
                                result.type = gpf.fs.TYPE_DIRECTORY;
                            } else if (stats.isFile()) {
                                result.type = gpf.fs.TYPE_FILE;
                            } else {
                                result.type = gpf.fs.TYPE_UNKNOWN;
                            }
                            gpf.events.fire("ready", {
                                info: result
                            }, eventsHandler);
                        }
                    });
                } else {
                    gpf.events.fire("ready", {
                        info: {
                            type: gpf.fs.TYPE_NOT_FOUND
                        }
                    }, eventsHandler);
                }
            });
        };

        gpf.fs.readAsBinaryStream = function (path, eventsHandler) {
            // TODO handle error
            var nodeStream = _getNodeFS().createReadStream(path);
            gpf.events.fire("ready", {
                stream: new gpf.node.ReadableStream(nodeStream)
            }, eventsHandler);
        };

        gpf.fs.writeAsBinaryStream = function (path, eventsHandler) {
            // TODO handle error
            var nodeStream = _getNodeFS().createWriteStream(path);
            gpf.events.fire("ready", {
                stream: new gpf.node.WritableStream(nodeStream)
            }, eventsHandler);
        };

        gpf.fs.close = function (stream) {
            gpf.interfaces.ignoreParameter(stream);
            // TODO not sure what I should do with it...
        };

    }

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/