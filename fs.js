/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    var
        gpfI = gpf.interfaces;

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
         * @eventParam {Object} infos contains:
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

    // TODO closing a file?

    if ("nodejs" === gpf.host() || "phantomjs" === gpf.host()) {

        var _fs,
            _getNodeFS = function () {
            if (undefined === _fs) {
                _fs = require("fs");
            }
            return _fs;
        };

        /**
         * @class NodeFileStream
         * @implements gpf.interfaces.IStream
         * @private
         */
        gpf.define("NodeFileStream", {

            "[Class]": [gpf.$InterfaceImplement(gpfI.IStream)],

            public: {

                constructor: function (fd) {
                    this._fd = fd;
                    this._buffer = new Buffer(NodeFileStream.BUFFER_SIZE);
                },

                /**
                 * @inheritDoc gpf.interfaces.IReadableStream:read
                 */
                "[read]": [gpf.$ClassEventHandler()],
                read: function (size, eventsHandler) {
                    gpf.interfaces.ignoreParameter(size);
                    gpf.interfaces.ignoreParameter(eventsHandler);
                },

                /**
                 * @inheritDoc gpf.interfaces.IWritableStream:write
                 */
                "[write]": [gpf.$ClassEventHandler()],
                write: function (int8buffer, eventsHandler) {
                    gpf.interfaces.ignoreParameter(int8buffer);
                    gpf.interfaces.ignoreParameter(eventsHandler);
                }

            },

            private: {

                /**
                 * NodeJS file descriptor
                 *
                 * @type {*}
                 * private
                 */
                _fd: null,

                /**
                 * NodeJS buffer
                 *
                 * @type {Object}
                 * private
                 */
                _buffer: null

            },

            static: {

                BUFFER_SIZE: 4096

            }

        });

        gpf.fs.getInfo = function (path, eventsHandler) {
            _getNodeFS().exists(path, function (exists) {
                if (exists) {
                    _getNodeFS().stat(path, function (err, stats) {
                        var result;
                        if (err) {
                            gpf.events.fire("error", {
                                error: err
                            }, eventsHandler);
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
                                infos: result
                            }, eventsHandler);
                        }
                    });
                } else {
                    gpf.events.fire("ready", {
                        infos: {
                            type: gpf.fs.TYPE_NOT_FOUND
                        }
                    }, eventsHandler);
                }
            });
        };

        gpf.fs.readAsBinaryStream = function (path, eventsHandler) {
            _getNodeFS().open(path, "r", function (err, fd) {
                if (err) {
                    gpf.events.fire("error", {
                        error: err
                    }, eventsHandler);
                } else {

                }


            });
        };

    }

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/