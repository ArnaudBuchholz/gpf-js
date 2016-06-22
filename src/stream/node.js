/*#ifndef(UMD)*/
"use strict";
/*global _GPF_EVENT_DATA*/ // gpf.events.EVENT_DATA
/*global _GPF_EVENT_END_OF_DATA*/ // gpf.events.EVENT_END_OF_DATA
/*global _GPF_EVENT_ERROR*/ // gpf.events.EVENT_ERROR
/*global _GPF_EVENT_READY*/ // gpf.events.EVENT_READY
/*global _gpfAssert*/ // Assertion method
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _gpfI*/ // gpf.interfaces
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfInNode*/ // The current host is a nodeJS like
/*exported _GpfNodeStream*/ // Encapsulation of nodeJS streams
/*#endif*/

if (_gpfInNode) {

    var // Base class of GPF NodeJS streams
        _GpfNodeStream = _gpfDefine("gpf.node.Stream", {
            "+": {

                // @param {Object} stream
                constructor: function (stream) {
                    this._stream = stream;
                },

                /**
                 * Close the current stream
                 *
                 * @param {gpf.events.Handler} eventsHandler
                 *
                 * @event gpf.events.EVENT_READY
                 */
                close: function (eventsHandler) {
                    _gpfIgnore(eventsHandler);
                    throw gpf.Error.abstractMethod();
                }

            },
            "#": {

                // property {Object} Node stream
                _stream: null,

                // @property {gpf.events.Handler} Last read eventsHandler also used as a critical section
                _eventsHandler: null,

                /**
                 * Sets the _eventsHandler variable, fails if already existing (this is significant of a read/write
                 * operation that is in progress).
                 *
                 * @param {gpf.events.Handler} eventsHandler Events handler
                 * @param {Function} errorFactory Builds the error to throw
                 */
                _setEventsHandler: function (eventsHandler, errorFactory) {
                    if (null !== this._eventsHandler) {
                        throw errorFactory();
                    }
                    this._eventsHandler = eventsHandler;
                },

                /**
                 * Provides an atomic access to the _eventsHandler variable (that is immediately cleared)
                 *
                 * @return {gpf.events.Handler}
                 */
                _getEventsHandler: function () {
                    var result = this._eventsHandler;
                    _gpfAssert(null !== result, "Event handler expected");
                    this._eventsHandler = null;
                    return result;
                }

            }
        });

    /**
     * Wraps a readable stream from NodeJS into a IReadableStream
     *
     * @class gpf.stream.NodeReadable
     * @extends {gpf.node.Stream}
     * @implements gpf.interfaces.IReadableStream
     */
    _gpfDefine("gpf.node.ReadableStream", _GpfNodeStream, {
        "[Class]": [gpf.$InterfaceImplement(_gpfI.IReadableStream)],
        "+": {

            // @param {stream.Readable} stream
            constructor: function (stream) {
                this._super(stream);
                stream.on("end", this._onEnd.bind(this));
                stream.on("error", this._onError.bind(this));
                this._boundOnReadable =  this._onReadable.bind(this);
            },

            // @inheritdoc gpf.node.Stream#close
            close: function (eventsHandler) {
                _gpfEventsFire.call(this, _GPF_EVENT_READY, {}, eventsHandler);
            },

            //region gpf.interfaces.IReadableStream

            // @inheritdoc gpf.interfaces.IReadableStream#read
            read: function (size, eventsHandler) {
                var chunk;
                this._setEventsHandler(eventsHandler, gpf.Error.readInProgress);
                // If we received the "readable" event
                if (this._readable) {
                    // We try to read a chunk
                    chunk = this._stream.read(size);
                    if (chunk) {
                        this._onData(chunk);
                        return;
                    }
                    // No chunk means we must wait for next "readable"
                    this._readable = false;
                }
                this._size = size;
                this._stream.once("readable", this._boundOnReadable);
            }

            //endregion

        },
        "#": {

            // @property {Boolean} Before doing any read on the stream, we wait for the readable event to be thrown
            _readable: false,

            // @property {Number} Last read size (if pending)
            _size: 0,

            /**
             * Handles "readable" stream event
             * NOTE that it was registered with once
             */
            _onReadable: function () {
                this._readable = true;
                this._onData(this._stream.read(this._size));
            },

            // @property {Function} onReadable bound to this
            _boundOnReadable: null,

            /**
             * Handles "data" stream event
             *
             * @param {Buffer} chunk
             */
            _onData: function (chunk) {
                _gpfEventsFire.call(this, _GPF_EVENT_DATA, {buffer: gpf.node.buffer2JsArray(chunk)},
                    this._getEventsHandler());
            },

            _onEnd: function () {
                _gpfEventsFire.call(this, _GPF_EVENT_END_OF_DATA, {}, this._getEventsHandler());
            },

            _onError: function (error) {
                _gpfEventsFire.call(this, _GPF_EVENT_ERROR, {error: error}, this._getEventsHandler());
            }

        }
    });

    /**
     * Wraps a writable stream from NodeJS into a IReadableStream
     *
     * @class gpf.stream.NodeWritable
     * @extends {gpf.node.Stream}
     * @implements gpf.interfaces.IReadableStream
     */
    _gpfDefine("gpf.node.WritableStream", _GpfNodeStream, {
        "[Class]": [gpf.$InterfaceImplement(_gpfI.IWritableStream)],
        "+": {

            // @param {stream.Writable} stream
            constructor: function (stream) {
                this._super(stream);
                this._boundOnWritten =  this._onWritten.bind(this);
            },

            // @inheritdoc gpf.node.Stream#close
            close: function (eventsHandler) {
                var me = this;
                this._stream.end(function () {
                    _gpfEventsFire.call(me, _GPF_EVENT_READY, {}, eventsHandler);
                });
            },

            //region gpf.interfaces.IWritableStream

            // @inheritdoc gpf.interfaces.IWritableStream#write
            write: function (buffer, eventsHandler) {
                this._setEventsHandler(eventsHandler, gpf.Error.writeInProgress);
                this._stream.write(buffer, this._boundOnWritten);
            }

            //endregion

        },
        "#": {

            // @property {gpf.events.Handler} Last read eventsHandler also used as a critical section
            _eventsHandler: null,

            /**
             * Handles the write callback
             * NOTE used through the _boundOnWritten member
             */
            _onWritten: function (error) {
                if (error) {
                    _gpfEventsFire.call(this, _GPF_EVENT_ERROR, {error: error}, this._getEventsHandler());
                } else {
                    _gpfEventsFire.call(this, _GPF_EVENT_READY, {}, this._getEventsHandler());
                }
            },

            // @property {Function} onWritten bound to this
            _boundOnWritten: null

        }
    });

}
