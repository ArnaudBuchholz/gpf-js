/*#ifndef(UMD)*/
"use strict";
/*global _GPF_EVENT_DATA*/ // gpf.events.EVENT_DATA
/*global _GPF_EVENT_END_OF_DATA*/ // gpf.events.EVENT_END_OF_DATA
/*global _GPF_EVENT_READY*/ // gpf.events.EVENT_READY
/*global _gpfAssert*/ // Assertion method
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _gpfExtend*/ // gpf.extend
/*global _gpfI*/ // gpf.interfaces
/*global _gpfStreamPipe*/ // gpf.stream.pipe
/*exported _gpfArrayStream*/ // IReadableStream & IWritableStream for array
/*#endif*/

var
    /**
     * Implements IReadableStream & IWritableStream on top of an array (FIFO read / write)
     * NOTE content is ignored, only the array logic is used
     *
     * @class ArrayStream
     * @extends Object
     * @implements gpf.interfaces.IReadableStream, gpf.interfaces.IWritableStream
     */
    _GpfArrayStream = _gpfDefine("ArrayStream", Object, {
        "[Class]": [gpf.$InterfaceImplement(_gpfI.IReadableStream), gpf.$InterfaceImplement(_gpfI.IWritableStream)],
        "+": {

            /**
             * @param {Array} [array=undefined] array Cloned
             * @constructor
             */
            constructor: function (array) {
                if (array instanceof Array) {
                    this._buffer = [].concat(array);
                } else {
                    this._buffer = [];
                }
            },

            //region gpf.interfaces.IReadableStream

            // @inheritdoc gpf.interfaces.IReadableStream#read
            read: function (count, eventsHandler) {
                var result;
                if (0 === this._buffer.length) {
                    _gpfEventsFire.apply(this, [_GPF_EVENT_END_OF_DATA, {}, eventsHandler]);
                } else {
                    result = this._buffer.splice(0, count);
                    _gpfEventsFire.apply(this, [_GPF_EVENT_DATA, {buffer: result}, eventsHandler]);
                }
            },

            //endregion

            //region gpf.interfaces.IReadableStream

            // @inheritdoc gpf.interfaces.IWritableStream#read
            write: function (buffer, eventsHandler) {
                _gpfAssert(buffer instanceof Array, "Array expected");
                this._buffer = this._buffer.concat(buffer);
                _gpfEventsFire.apply(this, [_GPF_EVENT_READY, {}, eventsHandler]);
            },

            //endregion

            /**
             * Consolidate the result array
             * @return {Array}
             */
            toArray: function () {
                return [].concat(this._buffer);
            }

        },
        "-": {

            // @property {Array} buffer
            _buffer: []

        }
    });

_gpfExtend(gpf, {

    /**
     * Converts the string into a stream
     *
     * @param {Array} that
     * @return {Object} Implementing gpf.interfaces.IReadableStream & gpf.interfaces.IWritableStream
     */
    arrayToStream: function (that) {
        return new _GpfArrayStream(that);
    },

    /**
     * Converts the stream into an array
     *
     * @param {gpf.interfaces.IReadableStream} stream
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event gpf.events.EVENT_READY
     * finished reading the stream, the buffer is provided
     *
     * @eventParam {Array} buffer
     */
    arrayFromStream: function (stream, eventsHandler) {
        if (stream instanceof _GpfArrayStream) {
            _gpfEventsFire(_GPF_EVENT_READY, {buffer: stream.toArray()}, eventsHandler);
        } else {
            var arrayStream = new _GpfArrayStream();
            _gpfStreamPipe({
                readable: stream,
                writable: arrayStream
            }, function (event) {
                if (_GPF_EVENT_READY === event.type) {
                    _gpfEventsFire(_GPF_EVENT_READY, {buffer: arrayStream.toArray()}, eventsHandler);
                } else {
                    _gpfEventsFire(event, {}, eventsHandler);
                }
            });
        }
    }

});
