/**
 * @file NodeJS specific stream implementation
 * @since 0.1.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfStreamSecureRead*/ // Generate a wrapper to secure multiple calls to stream#read
/*global _gpfStreamSecureWrite*/ // Generates a wrapper to secure multiple calls to stream#write
/*exported _GpfNodeBaseStream*/ // gpf.node.BaseStream
/*exported _GpfNodeReadableStream*/ // gpf.node.ReadableStream
/*exported _GpfNodeWritableStream*/ // gpf.node.WritableStream
/*#endif*/

var
    _GpfNodeBaseStream = _gpfDefine({
        $class: "gpf.node.BaseStream",

        /**
         * Base class wrapping NodeJS streams
         *
         * @param {Object} stream NodeJS stream object
         * @param {Function} [close] Close handler
         *
         * @constructor gpf.node.BaseStream
         * @since 0.1.9
         */
        constructor: function (stream, close) {
            this._stream = stream;
            if (typeof close === "function") {
                this._close = close;
            }
            stream.on("error", this._onError.bind(this));
        },

        /**
         * Function to be called when the stream is closed
         * @type {Function}
         * @since 0.1.9
         */
        _close: _gpfEmptyFunc,

        /**
         * Close the stream
         *
         * @return {Promise} Resolved when closed
         * @since 0.1.9
         */
        close: function () {
            return this._close();
        },

        //region Error handling

        /**
         * NodeJS stream object
         * @since 0.1.9
         */
        _stream: null,

        /**
         * The stream has an invalid state and can't be used anymore
         * @since 0.1.9
         */
        _invalid: false,

        /**
         * Current promise rejection callback
         * @type {Function}
         * @since 0.1.9
         */
        _reject: gpf.Error.invalidStreamState,

        /**
         * If the stream has an invalid state, the exception {@see gpf.Error.InvalidStreamState} is thrown
         *
         * @throws {gpf.Error.InvalidStreamState}
         * @since 0.1.9
         */
        _checkIfValid: function () {
            if (this._invalid) {
                gpf.Error.invalidStreamState();
            }
        },

        /**
         * Bound to the error event of the stream, reject the current promise if it occurs.
         *
         * @param {*} error Stream error
         * @since 0.1.9
         */
        _onError: function (error) {
            this._invalid = true;
            this._reject(error);
        }

        //endregion

    }),

    /**
     * Wraps a readable stream from NodeJS into a IReadableStream
     *
     * @param {Object} stream NodeJS stream object
     * @param {Function} [close] Close handler
     *
     * @class gpf.node.ReadableStream
     * @extends gpf.node.BaseStream
     * @implements {gpf.interfaces.IReadableStream}
     * @since 0.1.9
     */
    _GpfNodeReadableStream = _gpfDefine({
        $class: "gpf.node.ReadableStream",
        $extend: "gpf.node.BaseStream",

        //region gpf.interfaces.IReadableStream

        /**
         * @gpf:sameas gpf.interfaces.IReadableStream#read
         * @since 0.1.9
         */
        read: _gpfStreamSecureRead(function (output) {
            var me = this, //eslint-disable-line no-invalid-this
                stream = me._stream;
            return new Promise(function (resolve, reject) {
                me._reject = reject;
                me._checkIfValid();
                stream
                    .on("data", me._onData.bind(me, output))
                    .on("end", function () {
                        me._invalid = true;
                        resolve();
                    });
            });
        }),

        //endregion

        /**
         * Stream 'data' event handler
         *
         * @param {gpf.interfaces.IWritableStream} output Output stream
         * @param {Object} chunk Buffer
         * @since 0.1.9
         */
        _onData: function (output, chunk) {
            var me = this,
                stream = me._stream;
            stream.pause();
            output.write(chunk)
                .then(function () {
                    stream.resume();
                }, me._reject);
        }

    }),

    /**
     * Wraps a writable stream from NodeJS into a IWritableStream
     *
     * @param {Object} stream NodeJS stream object
     * @param {Function} [close] Close handler
     *
     * @class gpf.node.WritableStream
     * @extends gpf.node.BaseStream
     * @implements {gpf.interfaces.IWritableStream}
     * @since 0.1.9
     */
    _GpfNodeWritableStream = _gpfDefine({
        $class: "gpf.node.WritableStream",
        $extend: "gpf.node.BaseStream",

        //region gpf.interfaces.IWritableStream

        /**
         * @gpf:sameas gpf.interfaces.IWritableStream#write
         * @since 0.1.9
         */
        write: _gpfStreamSecureWrite(function (buffer) {
            var me = this, //eslint-disable-line no-invalid-this
                stream = me._stream;
            return new Promise(function (resolve, reject) {
                me._reject = reject;
                me._checkIfValid();
                if (stream.write(buffer)) {
                    return resolve();
                }
                stream.once("drain", resolve);
            });
        })

        //endregion

    });
