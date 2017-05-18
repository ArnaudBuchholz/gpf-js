/**
 * @file Rhino specific stream implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfHost*/ // Host type
/*global _gpfStreamSecureRead*/ // Generate a wrapper to secure multiple calls to stream#read
/*global _gpfStreamSecureWrite*/ // Generates a wrapper to secure multiple calls to stream#write
/*exported _GpfRhinoBaseStream*/ // gpf.rhino.BaseStream
/*exported _GpfRhinoReadableStream*/ // gpf.rhino.ReadableStream
/*exported _GpfRhinoWritableStream*/ // gpf.rhino.WritableStream
/*#endif*/

/*jshint rhino: true*/
/*eslint-env rhino*/

/* istanbul ignore else */ // Because tested with NodeJS
if (_GPF_HOST.RHINO === _gpfHost) {

    var
        _GpfRhinoBaseStream = _gpfDefine(/** @lends gpf.rhino.BaseStream */ {
            $class: "gpf.rhino.BaseStream",

            /**
             * Base class wrapping Rhino streams
             *
             * @param {java.io.InputStream|java.io.OutputStream} stream Rhino input or output stream object
             *
             * @constructor gpf.rhino.BaseStream
             * @private
             */
            constructor: function (stream) {
                this._stream = stream;
            },

            /**
             * Close the stream
             *
             * @return {Promise} Resolved when closed
             */
            close: function () {
                this._stream.close();
                return Promise.resolve();
            },

            /**
             * Rhino stream object
             *
             * @type {java.io.InputStream|java.io.OutputStream}
             */
            _stream: null

        }),

        /**
         * Wraps a readable stream from Rhino into a IReadableStream
         *
         * @param {java.io.InputStream} stream Rhino stream object
         *
         * @class gpf.rhino.ReadableStream
         * @extends gpf.rhino.BaseStream
         * @implements {gpf.interfaces.IReadableStream}
         */
        _GpfRhinoReadableStream = _gpfDefine(/** @lends gpf.rhino.ReadableStream */{
            $class: "gpf.rhino.ReadableStream",
            $extend: "gpf.rhino.BaseStream",

            //region gpf.interfaces.IReadableStream

            /**
             * @gpf:sameas gpf.interfaces.IReadableStream#read
             */
            read: _gpfStreamSecureRead(function (output) {
                var scanner = new java.util.Scanner(this._stream); //eslint-disable-line no-invalid-this
                return output.write(String(scanner.useDelimiter("\\A").next()));
            })

            //endregion

        }),

        /**
         * Wraps a writable stream from Rhino into a IWritableStream
         *
         * @param {java.io.OutputStream} stream Rhino stream object
         *
         * @class gpf.rhino.WritableStream
         * @extends gpf.rhino.BaseStream
         * @implements {gpf.interfaces.IWritableStream}
         */
        _GpfRhinoWritableStream = _gpfDefine(/** @lends gpf.rhino.WritableStream */{
            $class: "gpf.rhino.WritableStream",
            $extend: "gpf.rhino.BaseStream",

            constructor: function (stream) {
                this.$super(stream);
                this._writer = new java.io.OutputStreamWriter(stream);
            },

            //region gpf.interfaces.IWritableStream

            /**
             * @gpf:sameas gpf.interfaces.IWritableStream#write
             */
            write: _gpfStreamSecureWrite(function (buffer) {
                var writer = this._writer; //eslint-disable-line no-invalid-this
                writer.write(buffer);
                writer.flush();
                return Promise.resolve();
            }),

            //endregion

            /** @inheritdoc */
            close: function () {
                this._writer.close();
                return this.$super();
            },

            /**
             * Stream writer
             *
             * @type {java.io.OutputStreamWriter}
             */
            _writer: null

        });

}
