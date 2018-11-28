/**
 * @file Java specific stream implementation
 * @since 0.2.4
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfStreamSecureRead*/ // Generate a wrapper to secure multiple calls to stream#read
/*global _gpfStreamSecureWrite*/ // Generates a wrapper to secure multiple calls to stream#write
/*exported _GpfStreamJavaBase*/ // gpf.java.BaseStream
/*exported _GpfStreamJavaReadable*/ // gpf.java.ReadableStream
/*exported _GpfStreamJavaWritable*/ // gpf.java.WritableStream
/*#endif*/

/*jshint rhino: true*/
/*eslint-env rhino*/

var
    _GpfStreamJavaBase = _gpfDefine({
        $class: "gpf.java.BaseStream",

        /**
         * Base class wrapping Rhino streams
         *
         * @param {java.io.InputStream|java.io.OutputStream} stream Rhino input or output stream object
         *
         * @constructor gpf.java.BaseStream
         * @since 0.2.4
         */
        constructor: function (stream) {
            this._stream = stream;
        },

        /**
         * Close the stream
         *
         * @return {Promise} Resolved when closed
         * @since 0.2.4
         */
        close: function () {
            this._stream.close();
            return Promise.resolve();
        },

        /**
         * Rhino stream object
         *
         * @type {java.io.InputStream|java.io.OutputStream}
         * @since 0.2.4
         */
        _stream: null

    }),

    /**
     * Wraps a readable stream from Rhino into a IReadableStream
     *
     * @param {java.io.InputStream} stream Rhino stream object
     *
     * @class gpf.java.ReadableStream
     * @extends gpf.java.BaseStream
     * @implements {gpf.interfaces.IReadableStream}
     * @since 0.2.4
     */
    _GpfStreamJavaReadable = _gpfDefine({
        $class: "gpf.java.ReadableStream",
        $extend: _GpfStreamJavaBase,

        //region gpf.interfaces.IReadableStream

        /**
         * Process error that occurred during the stream reading
         *
         * @param {Error} e Error coming from read
         * @return {Promise} Read result replacement
         * @since 0.2.4
         */
        _handleError: function (e) {
            if (e instanceof java.util.NoSuchElementException // false on Rhino
                || e.message.startsWith("java.util.NoSuchElementException")) {
                // Empty stream
                return Promise.resolve();
            }
            return Promise.reject(e);
        },

        /**
         * @gpf:sameas gpf.interfaces.IReadableStream#read
         * @since 0.2.4
         */
        read: _gpfStreamSecureRead(function (output) {
            try {
                var scanner = new java.util.Scanner(this._stream); //eslint-disable-line no-invalid-this
                return output.write(String(scanner.useDelimiter("\\A").next()));
            } catch (e) {
                return this._handleError(e); //eslint-disable-line no-invalid-this
            }
        })

        //endregion

    }),

    /**
     * Wraps a writable stream from Rhino into a IWritableStream
     *
     * @param {java.io.OutputStream} stream Rhino stream object
     *
     * @class gpf.java.WritableStream
     * @extends gpf.java.BaseStream
     * @implements {gpf.interfaces.IWritableStream}
     * @since 0.2.4
     */
    _GpfStreamJavaWritable = _gpfDefine({
        $class: "gpf.java.WritableStream",
        $extend: _GpfStreamJavaBase,

        constructor: function (stream) {
            this.$super(stream);
            this._writer = new java.io.OutputStreamWriter(stream);
        },

        //region gpf.interfaces.IWritableStream

        /**
         * @gpf:sameas gpf.interfaces.IWritableStream#write
         * @since 0.2.4
         */
        write: _gpfStreamSecureWrite(function (buffer) {
            var writer = this._writer; //eslint-disable-line no-invalid-this
            writer.write(buffer);
            writer.flush();
            return Promise.resolve();
        }),

        //endregion

        /**
         * @inheritdoc
         * @since 0.2.4
         */
        close: function () {
            this._writer.close();
            return this.$super();
        },

        /**
         * Stream writer
         *
         * @type {java.io.OutputStreamWriter}
         * @since 0.2.4
         */
        _writer: null

    });
