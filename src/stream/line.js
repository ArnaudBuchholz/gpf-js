/**
 * @file Line adapter stream
 * @since 0.2.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfStreamBufferedRead*/ // gpf.stream.BufferedRead
/*global _gpfArrayForEach*/ // Almost like [].forEach (undefined are also enumerated)
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfStreamSecureWrite*/ // Generates a wrapper to secure multiple calls to stream#write
/*exported _GpfStreamLineAdatper*/ // gpf.stream.LineAdapter
/*#endif*/

var
    _reDOSCR = /\r\n/g,
    _GpfStreamLineAdatper = _gpfDefine(/** @lends gpf.stream.LineAdapter.prototype */ {
        $class: "gpf.stream.LineAdapter",
        $extend: _GpfStreamBufferedRead,

        /**
         * Stream line adapter
         *
         * @constructor gpf.stream.LineAdapter
         * @implements {gpf.interfaces.IReadableStream}
         * @implements {gpf.interfaces.IWritableStream}
         * @implements {gpf.interfaces.IFlushableStream}
         * @since 0.2.1
         */
        constructor: function () {
            this.$super();
            this._buffer = [];
        },

        //region gpf.interfaces.IReadableStream

        /**
         * @gpf:sameas gpf.interfaces.IWritableStream#write
         * @since 0.2.1
         */
        write: _gpfStreamSecureWrite(function (buffer) {
            var me = this; //eslint-disable-line no-invalid-this
            me._buffer.push(buffer.toString());
            me._process();
            return Promise.resolve();
        }),

        //endregion

        //region gpf.interfaces.IFlushableStream

        /**
         * @gpf:sameas gpf.interfaces.IFlushableStream#flush
         * @since 0.2.1
         */
        flush: function () {
            if (this._buffer.length) {
                this._buffer.push("\n");
                this._process();
            }
            this._completeReadBuffer();
            return Promise.resolve();
        },

        //endregion

        /**
         * Buffer
         * @since 0.2.1
         */
        _buffer: [],

        /**
         * Consolidate lines from buffer
         *
         * @return {String[]} Array of lines
         * @since 0.2.1
         */
        _consolidateLines: function () {
            return this._buffer
                .join("")
                .replace(_reDOSCR, "\n")
                .split("\n");
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
         * @since 0.2.1
         */
        _process: function () {
            var me = this,
                lines = me._consolidateLines();
            me._buffer.length = 0;
            me._pushBackLastLineIfNotEmpty(lines);
            _gpfArrayForEach(lines, function (line) {
                me._appendToReadBuffer(line);
            });
        }

    });
