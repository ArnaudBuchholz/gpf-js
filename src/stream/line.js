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

function _gpfStreamLineWrite (output, lines) {
    if (!lines.length) {
        return Promise.resolve();
    }
    var line = lines.shift(),
        lengthMinus1 = line.length - 1;
    if (line.lastIndexOf("\r") === lengthMinus1) {
        line = line.substr(0, lengthMinus1);
    }
    return output.write(line)
       .then(function () {
           return _gpfStreamLineWrite(output, lines);
       });
}

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
            var me = this; //eslint-disable-line no-invalid-this
            me._output = output;
            if (me._buffer.length) {
                return me._process();
            }
            return Promise.resolve();
        }),

        //endregion

        //region gpf.interfaces.IReadableStream

        /** @gpf:sameas gpf.interfaces.IWritableStream#write */
        write: _gpfStreamSecureWrite(function (buffer) {
            var me = this; //eslint-disable-line no-invalid-this
            me._buffer.push(buffer.toString());
            if (me._output) {
                return me._process();
            }
            return Promise.resolve();
        }),

        //endregion

        /**
         * Output stream
         *
         * @type {gpf.interfaces.IWritableStream}
         */
        _output: null,

        /** Buffer */
        _buffer: [],

        /**
         * Check if the buffer contains any carriage return and write to output
         *
         * @return {Promise} Resolve when all lines were written
         */
        _process: function () {
            var me = this,
                lines = this._buffer.join("").split("\n"),
                lastLine;
            this._buffer.length = 0;
            lastLine = lines.pop();
            if (lastLine) {
                this._buffer.push(lastLine);
            }
            return _gpfStreamLineWrite(me._output, lines);
        }

    });

_gpfStreamSecureInstallProgressFlag(_GpfStreamLineAdatper);
