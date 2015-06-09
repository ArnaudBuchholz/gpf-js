/*#ifndef(UMD)*/
"use strict";
/*global _gpfInNode*/ // The current host is a nodeJS like
/*global _gpfI*/ // gpf.interfaces
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _GPF_EVENT_DATA*/ // gpf.events.EVENT_DATA
/*global _GPF_EVENT_END_OF_DATA*/ // gpf.events.EVENT_END_OF_DATA
/*global _GPF_EVENT_ERROR*/ // gpf.events.EVENT_ERROR
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfDefine*/ // Shortcut for gpf.define
/*#endif*/

if (_gpfInNode) {

    /**
     * Wraps a readable stream from NodeJS into a IReadableStream
     *
     * @class gpf.stream.NodeReadable
     * @implements gpf.interfaces.IReadableStream
     */
    _gpfDefine("gpf.node.ReadableStream", {

        "[Class]": [gpf.$InterfaceImplement(_gpfI.IReadableStream)],

        public: {

            /**
             * @param {stream.Readable} stream
             * @constructor
             */
            constructor: function (stream) {
                this._stream = stream;
                stream.on("end", this._onEnd.bind(this));
                stream.on("error", this._onError.bind(this));
            },

            /**
             * @inheritDoc gpf.interfaces.IReadableStream:read
             */
            "[read]": [gpf.$ClassEventHandler()],
            read: function (size, eventsHandler) {
                var chunk;
                // Used as a critical section to prevent concurrent reads
                if (null !== this._eventsHandler) {
                    throw gpf.Error.ReadInProgress();
                }
                this._eventsHandler = eventsHandler;
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
                this._stream.once("readable", this._onReadable.bind(this));
            }

        },

        protected: {

            /**
             * Before doing any read on the stream, we wait for the readable
             * event to be thrown
             *
             * @type {Boolean}
             * @protected
             */
            _readable: false,

            /**
             * Last read eventsHandler
             * Also used as a critical section to prevent concurrent reads
             *
             * @type {gpf.events.Handler}
             * @protected
             */
            _eventsHandler: null,

            /**
             * Last read size (if pending)
             *
             * @type {Number}
             * @protected
             */
            _size: 0,

            /**
             * Provides an atomic access to the _eventsHandler variable
             * (that is immediately cleared)
             *
             * @return {gpf.events.Handler}
             * @private
             */
            _getEventsHandler: function () {
                var result = this._eventsHandler;
                gpf.ASSERT(null !== result, "Event handler expected");
                this._eventsHandler = null;
                return result;
            },

            /**
             * Handles "readable" stream event
             * NOTE that it was registered with once
             *
             * @private
             */
            _onReadable: function() {
                this._readable = true;
                this._onData(this._stream.read(this._size));
            },

            /**
             * Handles "data" stream event
             *
             * @param {Buffer} chunk
             * @private
             */
            _onData: function(chunk) {
                _gpfEventsFire.apply(this, [
                    _GPF_EVENT_DATA,
                    {
                        buffer: gpf.node.buffer2JsArray(chunk)
                    },
                    this._getEventsHandler()
                ]);
            },

            _onEnd: function () {
                _gpfEventsFire.apply(this, [
                    _GPF_EVENT_END_OF_DATA,
                    {},
                    this._getEventsHandler()
                ]);
            },

            _onError: function (error) {
                _gpfEventsFire.apply(this, [
                    _GPF_EVENT_ERROR,
                    {
                        error: error
                    },
                    this._getEventsHandler()
                ]);
            }

        },

        private: {

            /**
             * @type {stream.Readable}
             * @private
             */
            _stream: null

        }

    });

    /**
     * Wraps a writable stream from NodeJS into a IReadableStream
     *
     * @class gpf.stream.NodeWritable
     * @implements gpf.interfaces.IReadableStream
     */
    _gpfDefine("gpf.node.WritableStream", {

        "[Class]": [gpf.$InterfaceImplement(_gpfI.IWritableStream)],

        public: {

            /**
             * @param {stream.Writable} stream
             * @constructor
             */
            constructor: function (stream) {
                this._stream = stream;
            },

            /**
             * @inheritDoc gpf.interfaces.IWritableStream:write
             */
            "[write]": [gpf.$ClassEventHandler()],
            write: function (buffer, eventsHandler) {
                _gpfIgnore(buffer);
                _gpfIgnore(eventsHandler);
                throw gpf.Error.NotImplemented();
            }

        },

        private: {

            /**
             * @type {stream.Writable}
             * @private
             */
            _stream: null

        }

    });

}
