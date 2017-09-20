/**
 * @file Line adapter stream
 * @since 0.2.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfStreamSecureInstallProgressFlag*/ // Install the progress flag used by _gpfStreamSecureRead and Write
/*global _gpfStreamSecureRead*/ // Generate a wrapper to secure multiple calls to stream#read
/*global _gpfStreamSecureWrite*/ // Generates a wrapper to secure multiple calls to stream#write
/*exported _GpfStreamLineAdatper*/ // gpf.stream.LineAdapter
/*#endif*/

function _gpfStreamLineLastDoesntEndsWithLF (buffer) {
    var lastItem = buffer[buffer.length - 1];
    return lastItem.charAt(lastItem.length - 1) !== "\n";
}

function _gpfStreamLineTrimCR (line) {
    var lengthMinus1 = line.length - 1;
    if (line.lastIndexOf("\r") === lengthMinus1) {
        return line.substr(0, lengthMinus1);
    }
    return line;
}

function _gpfStreamLineWrite (output, lines) {
    if (!lines.length) {
        return Promise.resolve();
    }
    return output.write(_gpfStreamLineTrimCR(lines.shift()))
       .then(function () {
           return _gpfStreamLineWrite(output, lines);
       });
}

var
    _GpfStreamLineAdatper = _gpfDefine(/** @lends gpf.stream.LineAdapter.prototype */ {
        $class: "gpf.stream.LineAdapter",

        /**
         * Stream line adapter
         *
         * @constructor gpf.stream.LineAdapter
         * @implements {gpf.interfaces.IReadableStream}
         * @implements {gpf.interfaces.IWritableStream}
         * @since 0.2.1
         */
        constructor: function () {
            this._buffer = [];
        },

        //region gpf.interfaces.IReadableStream

        /**
         * @gpf:sameas gpf.interfaces.IReadableStream#read
         * @since 0.2.1
         */
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

        /**
         * @gpf:sameas gpf.interfaces.IWritableStream#write
         * @since 0.2.1
         */
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
         * Completes the stream, flush the remaining characters as the last line if any
         *
         * @return {Promise} Resolve when written to the output
         * @todo This is experimental until a better way is found
         * @since 0.2.1
         */
        endOfStream: function () {
            if (_gpfStreamLineLastDoesntEndsWithLF(this._buffer)) {
                return this.write("\n");
            }
            return Promise.resolve();
        },

        /**
         * Output stream
         *
         * @type {gpf.interfaces.IWritableStream}
         * @since 0.2.1
         */
        _output: null,

        /**
         * Buffer
         * @since 0.2.1
         */
        _buffer: [],

        /**
         * Extract lines from buffer
         *
         * @return {String[]} Array of lines
         * @since 0.2.1
         */
        _extractLines: function () {
            return this._buffer.join("").split("\n");
        },

        /**
         * The array lines is built using split on \n. Hence, the last line is what comes after the last \n.
         * If not empty, it must be pushed back to the buffer.
         *
         * @param {String[]} lines Array of lines
         * @since 0.2.1
         */
        _pushBackLastLineIfNotEmpty: function (lines) {
            var lastLine = lines.pop();
            if (lastLine.length) {
                this._buffer.push(lastLine);
            }
        },

        /**
         * Check if the buffer contains any carriage return and write to output
         *
         * @return {Promise} Resolve when all lines were written
         * @since 0.2.1
         */
        _process: function () {
            var lines = this._extractLines();
            this._buffer.length = 0;
            this._pushBackLastLineIfNotEmpty(lines);
            return _gpfStreamLineWrite(this._output, lines);
        }

    });

_gpfStreamSecureInstallProgressFlag(_GpfStreamLineAdatper);
