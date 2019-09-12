/**
 * @file Array related streams
 * @since 0.2.2
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfStreamSecureInstallProgressFlag*/ // Install the progress flag used by _gpfStreamSecureRead and Write
/*global _gpfStreamSecureRead*/ // Generate a wrapper to secure multiple calls to stream#read
/*global _gpfStreamSecureWrite*/ // Generates a wrapper to secure multiple calls to stream#write
/*exported _GpfStreamReadableArray*/ // gpf.stream.ReadableArray
/*exported _GpfStreamWritableArray*/ // gpf.stream.WritableArray
/*#endif*/

var
    _GpfStreamReadableArray = _gpfDefine({
        $class: "gpf.stream.ReadableArray",

        /**
         * Wraps an array inside a readable stream.
         * Each array item is written separately to the output
         *
         * @constructor gpf.stream.ReadableArray
         * @implements {gpf.interfaces.IReadableStream}
         * @param {Array} buffer Array buffer
         * @since 0.2.2
         */
        constructor: function (buffer) {
            this._buffer = buffer;
        },

        //region gpf.interfaces.IReadableStream

        /**
         * @gpf:sameas gpf.interfaces.IReadableStream#read
         * @since 0.2.2
         */
        read: _gpfStreamSecureRead(function (output) {
            var buffer = this._buffer, //eslint-disable-line no-invalid-this
                step = 0;
            function write () {
                if (buffer.length === step) {
                    return Promise.resolve();
                }
                return output.write(buffer[step++]).then(write);
            }
            return write();
        }),

        //endregion

        /**
         * Buffer
         * @since 0.2.2
         */
        _buffer: []

    }),

    _GpfStreamWritableArray = _gpfDefine({
        $class: "gpf.stream.WritableArray",

        /**
         * Creates a writable stream that pushes all writes into an array
         *
         * @constructor gpf.stream.WritableArray
         * @implements {gpf.interfaces.IWritableStream}
         * @since 0.2.2
         */
        constructor: function () {
            this._buffer = [];
        },

        //region gpf.interfaces.IWritableStream

        /**
         * @gpf:sameas gpf.interfaces.IWritableStream#write
         * @since 0.2.2
         */
        write: _gpfStreamSecureWrite(function (buffer) {
            this._buffer.push(buffer); //eslint-disable-line no-invalid-this
            return Promise.resolve();
        }),

        //endregion

        /**
         * Gets the array containing writen data
         *
         * @return {Array} array containing writen data
         * @since 0.2.2
         */
        toArray: function () {
            return this._buffer;
        },

        /**
         * Buffer
         * @since 0.2.2
         */
        _buffer: []

    });

_gpfStreamSecureInstallProgressFlag(_GpfStreamReadableArray);
_gpfStreamSecureInstallProgressFlag(_GpfStreamWritableArray);
