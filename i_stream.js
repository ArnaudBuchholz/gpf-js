/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    var
        gpfI = gpf.interfaces,
        _BUFREADSTREAM_READ_SIZE        = 256,
        _BUFREADSTREAM_ISTATE_INIT        = 0,
        _BUFREADSTREAM_ISTATE_INPROGRESS  = 1,
        _BUFREADSTREAM_ISTATE_WAITING     = 2,
        _BUFREADSTREAM_ISTATE_EOS         = 3;

    /**
     * The Readable stream interface is the abstraction for a source of data
     * that you are reading from. In other words, data comes out of a Readable
     * stream.
     *
     * @class gpf.interfaces.IReadableStream
     * @extends gpf.interfaces.Interface
     */
    gpf._defIntrf("IReadableStream", {

        /**
         * Triggers the reading of data.
         * The expected behavior is:
         * - The callback is asynchronous
         * - One of the following callback must be called after a read
         *   - EVENT_ERROR: an error occurred.
         *     the stream can't be used after this.
         *   - EVENT_END_OF_STREAM: stream ended.
         *     the stream can't be used after this.
         *   - EVENT_DATA: a buffer is provided, it can't be empty.
         *
         * @param {Number} [size=0] size Number of bytes to read. Read
         * as much as possible if 0
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event data Some data is ready to be ready
         * @eventParam {gpf.IReadOnlyArray} buffer Bytes buffer
         *
         * @event eos No more data can be read from the stream
         *
         */
        read: function (size, eventsHandler) {
            gpf.interfaces.ignoreParameter(size);
            gpf.interfaces.ignoreParameter(eventsHandler);
        },

        static: {
            EVENT_ERROR: "error",
            EVENT_DATA: "data",
            EVENT_END_OF_STREAM: "eos",

            EXCEPTION_READ_IN_PROGRESS: {
                message: "Read in progress"
            }
        }

    });

    /**
     * The Writable stream interface is an abstraction for a destination that
     * you are writing data to.
     * The expected behavior is:
     * - The callback is asynchronous
     * - One of the following callback must be called after a read
     *   - EVENT_ERROR: an error occurred.
     *     the stream can't be used after this.
     *   - EVENT_READY: the write operation succeeded, the provided buffer has
     *     been fully written (otherwise an error is thrown)
     *
     * @class gpf.interfaces.IReadableStream
     * @extends gpf.interfaces.Interface
     */
    gpf._defIntrf("IWritableStream", {

        /**
         * Triggers the writing of data
         *
         * @param {IReadOnlyArray} int8buffer Buffer to write
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready it is appropriate to begin writing more data to the
         * stream
         *
         */
        write: function (int8buffer, eventsHandler) {
            gpf.interfaces.ignoreParameter(int8buffer);
            gpf.interfaces.ignoreParameter(eventsHandler);
        },

        static: {
            EVENT_ERROR: "error",
            EVENT_READY: "ready",

            EXCEPTION_WRITE_IN_PROGRESS: {
                message: "Read in progress"
            }
        }

    });

    /**
     * The stream combines both IReadableStream and IWritableStream
     */
    gpf._defIntrf("IStream", {

        /**
         * @inheritDoc gpf.interfaces.IReadableStream:read
         */
        read: function (size, eventsHandler) {
            gpf.interfaces.ignoreParameter(size);
            gpf.interfaces.ignoreParameter(eventsHandler);
        },

        /**
         * @inheritDoc gpf.interfaces.IWritableStream:write
         */
        write: function (int8buffer, eventsHandler) {
            gpf.interfaces.ignoreParameter(int8buffer);
            gpf.interfaces.ignoreParameter(eventsHandler);
        }

    });

    /**
     * Text stream: instead of an int8 buffer, the interface handles strings
     *
     * @class gpf.interfaces.ITextStream
     * @extends gpf.interfaces.IStream
     *
     * @event data Some data is ready to be ready
     * @eventParam {String} buffer
     */
    gpf._defIntrf("ITextStream", gpfI.IStream, {
    });

    /**
     * Internal helper to implement the expected write behavior in all streams
     * @inheritDoc gpf.interfaces.ITextStream:write
     */
    gpfI.ITextStream._write = function () {
        var argIdx, arg;
        for (argIdx = 0; argIdx < arguments.length; ++argIdx) {
            arg = arguments[argIdx];
            if (null !== arg && "string" !== typeof arg) {
                arg = arg.toString();
            }
            this.write_(arg);
        }
        if (0 === argIdx) { // No parameter at all
            this.write_(null);
        }
    };

    /**
     * Handles a buffered stream that depends on another stream
     *
     * @class gpf.BufferedOnReadStream
     * @implements gpf.interfaces.IReadableStream
     */
    gpf.define("gpf.BufferedOnReadStream", {

        "[Class]": [gpf.$InterfaceImplement(gpfI.IReadableStream)],

        protected: {

            /**
             * Underlying stream default read size
             *
             * @type {Number}
             * @protected
             */
            _readSize: _BUFREADSTREAM_READ_SIZE,

            /**
             * Process underlying stream buffer
             *
             * @param {Array} buffer
             * @protected
             */
            _addToBuffer: function (buffer) {
                gpf.interfaces.ignoreParameter(buffer);
            },

            /**
             * Underlying stream reached its end
             *
             * @protected
             */
            _endOfInputStream: function () {
            },

            /**
             * Send buffer part to the caller of this stream.
             * This default implementation checks the buffer type to switch
             * between string and byte array.
             *
             * @param {Array} buffer
             * @param {Number} size
             * @returns {Array}
             * @protected
             */
            _extractFromBuffer: function (buffer, size) {
                gpf.ASSERT(buffer.length, "Buffer is not empty");
                if ("string" === typeof buffer[0]) {
                    return gpf.stringExtractFromStringArray(buffer, size);
                } else {
                    if (size > buffer.length) {
                        size = buffer.length;
                    }
                    return buffer.splice(0, size);
                }
            }

        },

        public: {

            /**
             * @param {gpf.interfaces.IReadableStream} input
             * @constructor
             */
            constructor: function (input) {
                this._iStream = gpfI.query(input, gpfI.IReadableStream, true);
                this._outputBuffer = [];
            },

            //region gpf.interfaces.IReadableStream

            /**
             * @implements gpf.interfaces.IReadableStream:read
             */
            read: function (size, eventsHandler) {
                var
                    iState = this._iState,
                    buffer,
                    length = this._outputBufferLength;
                if (_BUFREADSTREAM_ISTATE_INPROGRESS === iState) {
                    // A read call is already in progress
                    throw gpfI.IReadableStream.EXCEPTION_READ_IN_PROGRESS;

                } else if (size < length
                    || length && _BUFREADSTREAM_ISTATE_EOS === iState) {
                    // Enough chars in the output buffer to do the read
                    // OR there won't be any more chars
                    buffer = this._extractFromBuffer(
                        this._outputBuffer, size
                    );
                    this._outputBufferLength -= buffer.length;
                    // Can output something
                    gpf.events.fire.apply(this, [
                        gpfI.IReadableStream.EVENT_DATA,
                        {
                            buffer: buffer
                        },
                        eventsHandler
                    ]);

                } else if (_BUFREADSTREAM_ISTATE_EOS === iState) {
                    // No more input and output buffer is empty
                    gpf.events.fire.apply(this, [
                        gpfI.IReadableStream.EVENT_END_OF_STREAM,
                        eventsHandler
                    ]);

                } else {
                    // Read input
                    if (_BUFREADSTREAM_ISTATE_INIT === this._iState) {
                        // Very first call, create callback for input reads
                        this._cbRead = new gpf.Callback(this._onRead, this);
                    }
                    this._iState = _BUFREADSTREAM_ISTATE_INPROGRESS;
                    // Backup parameters
                    this._size = size;
                    this._eventsHandler = eventsHandler;
                    this._iStream.read(this._readSize, this._cbRead);
                }
            }

            //endregion
        },

        //region Implementation

        private: {

            /**
             * Input stream
             * @type {gpf.interfaces.IReadableStream}
             */
            _iStream: null,

            /**
             * Input stream read callback (pointing to this:_onRead)
             * @type {gpf.Callback}
             */
            _cbRead: null,

            /**
             * Output buffer contains items to be read
             * @type {*[]}
             */
            _outputBuffer: [],

            /**
             * Size of the output buffer (number of bytes)
             * @type {Number}
             */
            _outputBufferLength: 0,

            /**
             * Input state
             * @type {Number} see _BUFREADSTREAM_ISTATE_xxx
             */
            _iState: _BUFREADSTREAM_ISTATE_INIT,

            /**
             * Pending read call size
             * @type {Number}
             */
            _size: 0,

            /**
             * Pending read call event handlers
             * @type {gpf.events.Handler}
             */
            _eventsHandler: null,

            /**
             * Handles input stream read event
             *
             * @param {gpf.events.Event} event
             * @private
             */
            _onRead: function (event) {
                var
                    type = event.type();
                if (type === gpfI.IReadableStream.EVENT_END_OF_STREAM) {
                    this._iState = _BUFREADSTREAM_ISTATE_EOS;
                    this._endOfInputStream();
                    // Redirect to read with backed parameters
                    return this.read(this._size, this._eventsHandler);

                } else if (type === gpfI.IReadableStream.EVENT_ERROR) {
                    // Forward the event
                    gpf.events.fire.apply(this, [
                        event,
                        this._eventsHandler
                    ]);

                } else {
                    this._iState = _BUFREADSTREAM_ISTATE_WAITING;
                    this._addToBuffer(event.get("buffer"));
                    if (0 < this._outputBufferLength) {
                        // Redirect to read with backed parameters
                        return this.read(this._size, this._eventsHandler);
                    } else {
                        // Try to read source again
                        this._iStream.read(_BUFREADSTREAM_READ_SIZE,
                            this._cbRead);
                    }
                }
            }

        }

        //endregion
    });

    //endregion

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/