/**
 * @file NodeJS specific stream implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _GPF_HOST*/
/*global _gpfHost*/
/*global _gpfCreateAbstractFunction*/ // Build a function that throws the abstractMethod exception
/*global _gpfStreamSecureRead*/
/*global _gpfStreamSecureWrite*/
/*#endif*/

if (_GPF_HOST.NODEJS === _gpfHost) {

    /**
     * Base class wrapping NodeJS streams
     *
     * @class {gpf.node.BaseStream}
     */
    _gpfDefine(/** @lends gpf.node.BaseStream */ {
        $class: "gpf.node.BaseStream",

        /**
         * @param {Object} stream NodeJS stream object
         * @constructor
         */
        constructor: function (stream) {
            this._stream = stream;
            stream.on("error", this._onError.bind(this));
        },

        /**
         * Close the stream
         *
         * @return {Promise} Resolved when closed
         */
        close: _gpfCreateAbstractFunction(0),

        //region Error handling

        /**
         * NodeJS stream object
         */
        _stream: null,

        /**
         * An error occurred
         */
        _failed: false,

        /**
         * Current promise rejection callback
         * @type {Function}
         */
        _reject: gpf.Error.invalidStreamState,

        /**
         * If an error occurred, the exception {@see gpf.Error.InvalidStreamState} is thrown
         *
         * @throws {gpf.Error.InvalidStreamState}
         */
        _hasFailed: function () {
            if (this._failed) {
                gpf.Error.invalidStreamState();
            }
        },

        /**
         * Bound to the error event of the stream, reject the current promise if it occurs.
         *
         * @param {*} error Stream error
         */
        _onError: function (error) {
            this._failed = true;
            this._reject(error);
        }

        //endregion

    });

    /**
     * Wraps a readable stream from NodeJS into a IReadableStream
     *
     * @class {gpf.node.ReadableStream}
     * @extends {gpf.node.BaseStream}
     * @implements {gpf.interfaces.IReadableStream}
     */
    _gpfDefine({
        $class: "gpf.node.ReadableStream",
        $extend: "gpf.node.BaseStream",

        /** @inheritdoc gpf.node.BaseStream#close */
        close: function () {
            return Promise.resolve();
        },

        //region gpf.interfaces.IReadableStream

        /** @inheritdoc gpf.interfaces.IReadableStream#read */
        read: _gpfStreamSecureRead(function (output) {
            var me = this,  //eslint-disable-line no-invalid-this
                stream = me._stream;
            return new Promise(function (resolve, reject) {
                me._reject = reject;
                stream
                    .on("data", me._onData.bind(me, output))
                    .on("end", resolve);
            });
        }),

        //endregion

        /**
         * Stream 'data' event handler
         *
         * @param {gpf.interfaces.IWritableStream} output Output stream
         * @param {Object} chunk Buffer
         */
        _onData: function (output, chunk) {
            var me = this,
                stream = me._stream;
            stream.pause();
            output.write(chunk)
                .then(function () {
                    stream.resume();
                }, function (e) {
                    stream.close();
                    me._reject(e);
                });
        }

    });

    /**
     * Wraps a writable stream from NodeJS into a IWritableStream
     *
     * @class {gpf.node.WritableStream}
     * @extends {gpf.node.BaseStream}
     * @implements {gpf.interfaces.IWritableStream}
     */
    _gpfDefine({

        /** @inheritdoc gpf.node.BaseStream#close */
        close: function () {
            return Promise.resolve();
        },

        //region gpf.interfaces.IReadableStream

        /** @inheritdoc gpf.interfaces.IWritableStream#write */
        read: _gpfStreamSecureWrite(function (buffer) {
            var me = this,  //eslint-disable-line no-invalid-this
                stream = me._stream;
            return new Promise(function (resolve, reject) {
                me._reject = reject;
                me._hasFailed();
                if (stream.write(buffer)) {
                    return resolve();
                }
                stream.once("drain", resolve);
            });
        })

        //endregion

    });

}
