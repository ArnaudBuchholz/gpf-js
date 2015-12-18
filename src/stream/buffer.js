/*#ifndef(UMD)*/
"use strict";
/*global _GPF_EVENT_READY*/
/*global _GPF_EVENT_END_OF_DATA*/
/*global _GPF_EVENT_DATA*/
/*global _gpfAssert*/ // Assertion method
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfStringArrayExtract*/ // Extract the first characters of a string array
/*global _gpfEventsFire*/
/*exported _gpfStreamBufferBase*/ // gpf.stream.BufferBase
/*exported _gpfStreamBufferRead*/ // Stream read method on gpf.stream.BufferBase instance
/*exported _gpfStreamBufferWrite*/ // Stream write method on gpf.stream.BufferBase instance
/*#endif*/

/**
 * Handles a buffered stream
 *
 * @class gpf.stream.BufferBase
 */
var _gpfStreamBufferBase = _gpfDefine("gpf.stream.BufferBase", Object, {
    "#": {

        // @property {Array} Buffer containing content to be read
        _buffer: [],

        // @property {Number} Length of the buffer (compared with read size)
        _bufferLength: 0,

        /**
         * Read from buffer.
         * This default implementation checks the buffer type to switch between string and byte array.
         *
         * @param {Number} size
         * @return {String|Array}
         */
        _readFromBuffer: function (size) {
            _gpfAssert(0 !== this._buffer.length, "Buffer is not empty");
            if ("string" === this._buffer[0]) {
                return this._readFromStringBuffer(size);
            }
            return this._readFromByteBuffer(size);
        },

        /**
         * Read string buffer
         *
         * @param {Number} size
         * @return {String}
         */
        _readFromStringBuffer: function (size) {
            var result = _gpfStringArrayExtract(this._buffer, size);
            this._bufferLength -= result.length;
            return result;
        },

        /**
         * Read byte buffer
         *
         * @param {Number} size
         * @return {Array}
         */
        _readFromByteBuffer: function (size) {
            this._bufferLength -= size;
            return this._buffer.splice(0, size);
        },

        /**
         * Write to buffer.
         * This default implementation checks the buffer type to switch between string and byte array.
         *
         * @param {String|Number[]} buffer
         */
        _writeToBuffer: function (buffer) {
            _gpfAssert("string" === typeof buffer || "number" === typeof buffer[0],
                "Buffer is either a string or an array of bytes");
            if ("string" === typeof buffer) {
                return this._writeToStringBuffer(buffer);
            }
            return this._writeToByteBuffer(buffer);
        },

        /**
         * Write to string buffer
         *
         * @param {String} buffer
         */
        _writeToStringBuffer: function (buffer) {
            _gpfAssert(buffer && buffer.length, "Buffer must contain data");
            this._buffer.push(buffer);
            this._bufferLength += buffer.length;
        },

        /**
         * Write to byte buffer
         *
         * @param {Number[]} buffer
         */
        _writeToByteBuffer: function (buffer) {
            _gpfAssert(buffer.every(function (value) {
                return "number" === typeof value && 0 <= value && 256 > value;
            }), "Buffer must contain only bytes");
            this._bufferLength += buffer.length;
            this._buffer = this._buffer.concat(buffer);
        }

    },
    "+": {

        constructor: function (buffer) {
            this._buffer = [];
            this._writeToBuffer(buffer);
        }

    }

});

// @inheritdoc gpf.interfaces.IReadableStream#read
function _gpfStreamBufferRead (count, eventsHandler) {
    /*jshint validthis:true*/
    var result;
    if (0 === this._bufferLength) {
        _gpfEventsFire.apply(this, [_GPF_EVENT_END_OF_DATA, {}, eventsHandler]);
    } else {
        result = this._readFromBuffer(count);
        _gpfEventsFire.apply(this, [_GPF_EVENT_DATA, {buffer: result}, eventsHandler]);
    }
}

// @inheritdoc gpf.interfaces.IWritableStream#read
function _gpfStreamBufferWrite (buffer, eventsHandler) {
    /*jshint validthis:true*/
    _gpfAssert(buffer && buffer.length, "Buffer must contain data");
    this._writeToBuffer(buffer);
    _gpfEventsFire.apply(this, [_GPF_EVENT_READY, {}, eventsHandler]);
}
