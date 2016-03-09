/*#ifndef(UMD)*/
"use strict";
/*global _gpfI*/ // gpf.interfaces
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _GPF_EVENT_READY*/ // gpf.events.EVENT_READY
/*global _gpfDefine*/ // Shortcut for gpf.define
/*#endif*/

/**
 * console.log exposed as an output stream.
 * Line is buffered until the carriage return.
 *
 * @class gpf.stream.Out
 * @implements gpf.interfaces.IWritableStream
 */
_gpfDefine("gpf.stream.Out", Object, {

    "[Class]": [gpf.$InterfaceImplement(_gpfI.IWritableStream)],

    "+": {

        /**
         * @constructor
         */
        constructor: function () {
            this._buffer = [];
        },

        /**
         * @inheritdoc gpf.interfaces.IWritableStream#write
         */
        write: function (buffer, eventsHandler) {
            // TODO: do we allow mixin strings & buffer
            if ("string" === typeof buffer) {
                this._writeString(buffer, eventsHandler);
            } else {
                this._writeBuffer(buffer, eventsHandler);
            }
        }

    },

    "-": {

        /**
         * Line buffer
         *
         * @type {String[]}
         * private
         */
        _buffer: [],

        /**
         * @inheritdoc gpf.interfaces.IWritableStream#write
         *
         * String version
         *
         * @private
         */
        _writeString: function (buffer, eventsHandler) {
            var
                lines = buffer.split("\n"),
                len,
                idx;
            len = lines.length;
            if (len) {
                // If the array has at least 2 elements, \n was present
                if (1 < len) {
                    console.log(this._buffer.join("")
                    + this._trimFinalR(lines[0]));
                    this._buffer = [];
                }
                --len;
                // The last item of the array did not have \n
                if (lines[len].length) {
                    this._buffer.push(lines[len]);
                }
                // Dump other lines
                for (idx = 1; idx < len; ++idx) {
                    console.log(this._trimFinalR(lines[idx]));
                }
            }
            _gpfEventsFire.call(this, _GPF_EVENT_READY, {}, eventsHandler);
        },

        /**
         * Remove final \r if any
         *
         * @param {String} line
         * @return {String}
         * @private
         */
        _trimFinalR: function (line) {
            var lastCharIdx = line.length - 1;
            if (-1 < lastCharIdx && line.charAt(lastCharIdx) === "\r") {
                return line.substr(0, lastCharIdx);
            }
            return line;
        },

        /**
         * @inheritdoc gpf.interfaces.IWritableStream#write
         *
         * String version
         *
         * @private
         */
        _writeBuffer: function (buffer, eventsHandler) {
            gpf.interfaces.ignore(buffer);
            gpf.interfaces.ignore(eventsHandler);
            /**
             * TODO implement
             * Would need to reuse UTF8 decoder in order to output
             * characters.
             * Maybe I can create a ReadableStream which input would be
             * appended with the buffer and rely on the createDecoder
             * stream.
             *
             * Right now: I don't need it.
             */
            throw gpf.Error.notImplemented();
        }

    }

});
