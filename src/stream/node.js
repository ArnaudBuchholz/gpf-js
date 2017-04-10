/**
 * @file NodeJS specific stream implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAssert*/ // Assertion method
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfI*/ // gpf.interfaces
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _GPF_HOST*/
/*global _gpfHost*/
/*global _gpfCreateAbstractFunction*/ // Build a function that throws the abstractMethod exception
/*#endif*/

if (_GPF_HOST.NODEJS === _gpfHost) {

    /**
     * Base class wrapping NodeJS streams
     *
     * @class {gpf.node.BaseStream}
     */
    _gpfDefine(/** @lends gpf.node.BaseStream */ {
        $class: "gpf.node.BaseStream",

        /**
         * @param {Object} stream NodeJS stream object
         * @constructor
         */
        constructor: function (stream) {
            this._stream = stream;
        },

        /**
         * Close the stream
         *
         * @return {Promise} Resolved when closed
         */
        close: _gpfCreateAbstractFunction(0),

        /**
         * @property {Object} NodeJS stream object
         */
        _stream: null,

    });

    /**
     * Wraps a readable stream from NodeJS into a IReadableStream
     *
     * @class {gpf.node.ReadableStream}
     * @extends {gpf.node.BaseStream}
     * @implements {gpf.interfaces.IReadableStream}
     */
    _gpfDefine({
        $class: "gpf.node.ReadableStream",
        $extend: "gpf.node.BaseStream",

        /**
         * @param {Object} stream NodeJS stream object
         * @constructor
         */
        constructor: function (stream) {
            this.$super(stream);
            stream.on("end", this._onEnd.bind(this));
            stream.on("error", this._onError.bind(this));
        },

        /** @inheritdoc gpf.node.BaseStream#close */
        close: function () {
            return Promise.resolve();
        },

        //region gpf.interfaces.IReadableStream

        /** @inheritdoc gpf.interfaces.IReadableStream#read */
        read: function (size) {
            var chunk = this._stream.read(size);


            this.read = gpf.Error.readInProgress;

            delete this.read;

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
