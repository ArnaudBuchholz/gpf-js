/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
"use strict";
/*global _gpfAssert*/ // Assertion method
/*global _gpfExtend*/ // gpf.extend
/*#endif*/

    var
        gpfI = gpf.interfaces,
        gpfFireEvent = gpf.events.fire,

        /**
         * Implements IStream on top of an array  (FIFO read / write)
         *
         * @class ArrayStream
         * @extends gpf.events.Target
         * @implements gpf.interfaces.ITextStream
         */
        ArrayStream = gpf.define("ArrayStream", {

            "[Class]": [gpf.$InterfaceImplement(gpf.interfaces.IStream)],

            public: {

                /**
                 * @param {Array} [array=undefined] array Cloned
                 * @constructor
                 */
                constructor: function(array){
                    if (undefined !== array && array.length) {
                        this._buffer = [].concat(array);
                    } else {
                        this._buffer = [];
                    }
                },

                //region gpf.interfaces.IStream

                /**
                 * @implements gpf.interfaces.IStream:read
                 */
                read: function(count, eventsHandler) {
                    var
                        result;
                    if (0 === this._buffer.length) {
                        gpfFireEvent.apply(this, [
                            gpfI.IReadableStream.EVENT_END_OF_STREAM,
                            eventsHandler
                        ]);
                    } else if (undefined === count
                        || count > this._buffer.length) {
                        result = this._buffer;
                        this._buffer = [];
                        gpfFireEvent.apply(this, [
                            gpfI.IReadableStream.EVENT_DATA,
                            {
                                buffer: result
                            },
                            eventsHandler
                        ]);
                    } else {
                        result = this._buffer.splice(0, count);
                        gpfFireEvent.apply(this, [
                            gpfI.IReadableStream.EVENT_DATA,
                            {
                                buffer: result
                            },
                            eventsHandler
                        ]);
                    }
                },

                /**
                 * @implements gpf.interfaces.ITextStream:write
                 */
                write: function (buffer, eventsHandler) {
                    _gpfAssert(buffer && buffer.length, "Write must contain data");
                    this._buffer = this._buffer.concat(buffer);
                    gpfFireEvent.apply(this, [
                        gpfI.IWritableStream.EVENT_READY,
                        eventsHandler
                    ]);
                },

                //endregion

                /**
                 * Consolidate the result array
                 * @return {Array}
                 */
                consolidateArray: function() {
                    return [].concat(this._buffer);
                }

            },

            private: {

                /**
                 * @type {Array}
                 */
                _buffer: []

            }

        });

    _gpfExtend(gpf, {

        "[arrayToStream]": [gpf.$ClassExtension(Array, "toStream")],

        /**
         * Converts the string into a stream
         *
         * @param {Array} that
         * @return {Object} Implementing gpf.interfaces.IStream
         */
        arrayToStream: function (that) {
            return new ArrayStream(that);
        },

        // TODO Should be a static extension as 'that' is not used
        "[arrayFromStream]": [gpf.$ClassExtension(Array, "fromStream")],

        /**
         * Converts the stream into an array
         *
         * @param {gpf.interfaces.ITextStream} stream
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event data finished reading the stream, the buffer is provided
         * @eventParam {Array} buffer
         *
         */
        arrayFromStream: function (stream, eventsHandler) {
            if (stream instanceof ArrayStream) {
                gpfFireEvent.apply(this, [
                    gpfI.IReadableStream.EVENT_DATA,
                    {
                        buffer: stream.consolidateArray()
                    },
                    eventsHandler
                ]);
                return;
            } else {
                gpf.stream.readAll(stream, _arrayStreamConcat, eventsHandler);
            }
        }

    });

    function _arrayStreamConcat(previous, buffer) {
        if (undefined === previous) {
            return buffer;
        } else if (undefined !== buffer) {
            previous = previous.concat(buffer);
            return previous;
        } else {
            return previous;
        }
    }

    /*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/