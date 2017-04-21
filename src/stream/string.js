/**
 * @file String related streams
 * @since 0.1.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfStreamSecureInstallProgressFlag*/ // Install the progress flag used by _gpfStreamSecureRead and Write
/*global _gpfStreamSecureRead*/ // Generate a wrapper to secure multiple calls to stream#read
/*global _gpfStreamSecureWrite*/ // Generates a wrapper to secure multiple calls to stream#write
/*#endif*/

var
    _gpfStreamReadableString = _gpfDefine(/** @lends gpf.node.ReadableString */ {
        $class: "gpf.stream.ReadableString",

        /**
         * Wraps a string inside a readable stream
         *
         * @constructor gpf.node.ReadableString
         * @implements {gpf.interfaces.IReadableStream}
         * @param {String} buffer String buffer
         * @since 0.1.9
         */
        constructor: function (buffer) {
            this._buffer = buffer;
        },

        //region gpf.interfaces.IReadableStream

        /**
         * @gpf:sameas gpf.interfaces.IReadableStream#read
         * @since 0.1.9
         */
        read: _gpfStreamSecureRead(function (output) {
            return output.write(this._buffer); //eslint-disable-line no-invalid-this
        }),

        //endregion

        /**
         * Buffer
         * @since 0.1.9
         */
        _buffer: ""

    }),

    /**
     * @since 0.1.9
     */
    _gpfStreamWritableString = _gpfDefine(/** @lends gpf.node.WritableString */ {
        $class: "gpf.stream.WritableString",

        /**
         * Creates a writable stream that can be converted to string
         *
         * @constructor gpf.node.WritableString
         * @implements {gpf.interfaces.IWritableStream}
         * @since 0.1.9
         */
        constructor: function () {
            this._buffer = [];
        },

        //region gpf.interfaces.IReadableStream

        /**
         * @gpf:sameas gpf.interfaces.IWritableStream#write
         * @since 0.1.9
         */
        write: _gpfStreamSecureWrite(function (buffer) {
            this._buffer.push(buffer.toString()); //eslint-disable-line no-invalid-this
            return Promise.resolve();
        }),

        //endregion

        toString: function () {
            return this._buffer.join("");
        },

        /**
         * Buffer
         *
         * @type {String[]}
         * @since 0.1.9
         */
        _buffer: []

    });

_gpfStreamSecureInstallProgressFlag(_gpfStreamReadableString);
_gpfStreamSecureInstallProgressFlag(_gpfStreamWritableString);
