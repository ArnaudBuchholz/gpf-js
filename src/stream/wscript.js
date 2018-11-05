/**
 * @file WScript specific stream implementation
 * @since 0.1.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfStreamSecureRead*/ // Generate a wrapper to secure multiple calls to stream#read
/*global _gpfStreamSecureWrite*/ // Generates a wrapper to secure multiple calls to stream#write
/*exported _GpfWscriptBaseStream*/ // gpf.wscript.BaseStream
/*exported _GpfWscriptReadableStream*/ // gpf.wscript.ReadableStream
/*exported _GpfWscriptWritableStream*/ // gpf.wscript.WritableStream
/*#endif*/

/*eslint-disable new-cap*/ // FileSystem object APIs are uppercased

var
    _GPF_STREAM_WSCRIPT_BUFFER_SIZE = 4096,

    _GpfWscriptBaseStream = _gpfDefine({
        $class: "gpf.wscript.BaseStream",

        /**
         * Base class wrapping NodeJS streams
         *
         * @constructor gpf.wscript.BaseStream
         * @param {Object} file File object
         * @since 0.1.9
         */
        constructor: function (file) {
            this._file = file;
        },

        /**
         * Close the stream
         *
         * @return {Promise} Resolved when closed
         * @since 0.1.9
         */
        close: function () {
            return new Promise(function (resolve) {
                this._file.Close();
                resolve();
            }.bind(this));
        }

    }),

    /**
     * Wraps a file object from FileSystemObject into a IReadableStream
     *
     * @class gpf.wscript.ReadableStream
     * @extends gpf.wscript.BaseStream
     * @implements {gpf.interfaces.IReadableStream}
     * @since 0.1.9
     */
    _GpfWscriptReadableStream = _gpfDefine({
        $class: "gpf.wscript.ReadableStream",
        $extend: "gpf.wscript.BaseStream",

        //region gpf.interfaces.IReadableStream

        /**
         * @gpf:sameas gpf.interfaces.IReadableStream#read
         * @since 0.1.9
         */
        read: _gpfStreamSecureRead(function (output) {
            var me = this, //eslint-disable-line no-invalid-this
                file = me._file;
            return new Promise(function (resolve) {
                function read () {
                    return output.write(file.Read(_GPF_STREAM_WSCRIPT_BUFFER_SIZE))
                        .then(function () {
                            if (!file.AtEndOfStream) {
                                return read();
                            }
                        });
                }
                return read().then(resolve);
            });
        })

        //endregion

    }),

    /**
     * Wraps a file object from FileSystemObject into a IWritableStream
     *
     * @class gpf.wscript.WritableStream
     * @extends gpf.wscript.BaseStream
     * @implements {gpf.interfaces.IWritableStream}
     * @since 0.1.9
     */
    _GpfWscriptWritableStream = _gpfDefine({
        $class: "gpf.wscript.WritableStream",
        $extend: "gpf.wscript.BaseStream",

        //region gpf.interfaces.IWritableStream

        /**
         * @gpf:sameas gpf.interfaces.IWritableStream#write
         * @since 0.1.9
         */
        write: _gpfStreamSecureWrite(function (buffer) {
            var me = this, //eslint-disable-line no-invalid-this
                file = me._file;
            return new Promise(function (resolve) {
                file.Write(buffer);
                resolve();
            });
        })

        //endregion

    });
