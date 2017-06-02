/**
 * @file Line adapter stream
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfStreamSecureInstallProgressFlag*/ // Install the progress flag used by _gpfStreamSecureRead and Write
/*global _gpfStreamSecureRead*/ // Generate a wrapper to secure multiple calls to stream#read
/*global _gpfStreamSecureWrite*/ // Generates a wrapper to secure multiple calls to stream#write
/*exported _GpfStreamLineAdatper*/ // gpf.stream.LineAdapter
/*#endif*/

var
    _GpfStreamLineAdatper = _gpfDefine(/** @lends gpf.stream.LineAdapter */ {
        $class: "gpf.stream.LineAdapter",

        /**
         * Stream line adapter
         *
         * @constructor gpf.stream.LineAdapter
         * @implements {gpf.interfaces.IReadableStream}
         * @implements {gpf.interfaces.IWritableStream}
         */
        constructor: function () {
            this._buffer = [];
        },

        //region gpf.interfaces.IReadableStream

        /** @gpf:sameas gpf.interfaces.IReadableStream#read */
        read: _gpfStreamSecureRead(function (output) {
            return output.write(this._buffer); //eslint-disable-line no-invalid-this
        }),

        //endregion

        //region gpf.interfaces.IReadableStream

        /** @gpf:sameas gpf.interfaces.IWritableStream#write */
        write: _gpfStreamSecureWrite(function (buffer) {
            this._buffer.push(buffer.toString()); //eslint-disable-line no-invalid-this
            return Promise.resolve();
        }),

        //endregion

        /** Buffer */
        _buffer: []

    });

_gpfStreamSecureInstallProgressFlag(_GpfStreamLineAdatper);
