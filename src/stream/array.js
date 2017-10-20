/**
 * @file Array related streams
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
    _GpfStreamReadableArray = _gpfDefine(/** @lends gpf.stream.ReadableArray.prototype */ {
        $class: "gpf.stream.ReadableArray",

        /**
         * Wraps an array inside a readable stream.
         * Each array item is written separately to the output
         *
         * @constructor gpf.stream.ReadableArray
         * @implements {gpf.interfaces.IReadableStream}
         * @param {Array} buffer Array buffer
         */
        constructor: function (buffer) {
            this._buffer = buffer;
        },

        //region gpf.interfaces.IReadableStream

        /**
         * @gpf:sameas gpf.interfaces.IReadableStream#read
         */
        read: _gpfStreamSecureRead(function (output) {
            var buffer = this._buffer, //eslint-disable-line no-invalid-this
                step = 0;
            function write () {
                if (buffer.length === step) {
                    return Promise.resolve();
                }
                return output.write(buffer[step++]);
            }
            return write();
        }),

        //endregion

        /**
         * Buffer
         */
        _buffer: []

    }),

    _GpfStreamWritableArray = _gpfDefine(/** @lends gpf.stream.WritableArray.prototype */ {
        $class: "gpf.stream.WritableArray",

        /**
         * Creates a writable stream that pushes all writes into an array
         *
         * @constructor gpf.stream.WritableArray
         * @implements {gpf.interfaces.IWritableStream}
         */
        constructor: function () {
            this._buffer = [];
        },

        //region gpf.interfaces.IReadableStream

        /**
         * @gpf:sameas gpf.interfaces.IWritableStream#write
         */
        write: _gpfStreamSecureWrite(function (buffer) {
            this._buffer.push(buffer); //eslint-disable-line no-invalid-this
            return Promise.resolve();
        }),

        //endregion

        toArray: function () {
            return this._buffer;
        },

        /**
         * Buffer
         */
        _buffer: []

    });

_gpfStreamSecureInstallProgressFlag(_GpfStreamReadableArray);
_gpfStreamSecureInstallProgressFlag(_GpfStreamWritableArray);
