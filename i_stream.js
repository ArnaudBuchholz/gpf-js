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

    //region Stream helpers

    gpf.stream = {};

    /**
     * Handles a buffered stream that depends on a read stream.
     * The way the underlying buffer is read and converted can be overridden
     * through the following protected APIs:
     * - _readSize
     * - _addToBuffer
     *
     * @class gpf.stream.BufferedOnRead
     * @abstract
     * @implements gpf.interfaces.IReadableStream
     */
    gpf.define("gpf.stream.BufferedOnRead", {

        "[Class]": [gpf.$InterfaceImplement(gpfI.IReadableStream)],

        //region Configurable part

        protected: {

            /**
             * Output buffer containing content to be read
             *
             * @type {*[]}
             * @protected
             */
            _buffer: [],

            /**
             * Length of the buffer (compared with read size)
             *
             * @type {Number}
             * @protected
             */
            _bufferLength: 0,

            /**
             * Underlying stream default read size
             *
             * @type {Number}
             * @protected
             */
            _readSize: _BUFREADSTREAM_READ_SIZE,

            /**
             * Process underlying stream buffer (this should grow the output
             * buffer)
             *
             * @param {Array} buffer
             * @abstract
             * @protected
             */
            _addToBuffer: function (buffer) {
                gpf.interfaces.ignoreParameter(buffer);
                gpf.Error.Abstract();
            },

            /**
             * Underlying stream reached its end (this may grow the output
             * buffer)
             *
             * @protected
             */
            _endOfInputStream: function () {
            },

            /**
             * Read buffer.
             * This default implementation checks the buffer type to switch
             * between string and byte array.
             *
             * @param {Number} size
             * @returns {String|Array}
             * @protected
             */
            _readFromBuffer: function (size) {
                gpf.ASSERT(0 !== this._buffer.length, "Buffer is not empty");
                if ("string" === this._buffer[0]) {
                    return this._readFromStringBuffer(size);
                } else {
                    return this._readFromByteBuffer(size);
                }
            },

            /**
             * Read string buffer.
             *
             * @param {Number} size
             * @returns {String}
             * @protected
             */
            _readFromStringBuffer: function (size) {
                var
                    result = gpf.stringExtractFromStringArray(this._buffer,
                        size);
                this._bufferLength -= result.length;
                return result;
            },

            /**
             * Read byte buffer.
             *
             * @param {Number} size
             * @returns {Array}
             * @protected
             */
            _readFromByteBuffer: function (size) {
                var
                    buffer = this._buffer,
                    len = buffer.length;
                if (size > len) {
                    size = len;
                }
                this._bufferLength -= size;
                return buffer.splice(0, size);
            }

        },

        //endregion

        //region Implementation

        public: {

            /**
             * @param {gpf.interfaces.IReadableStream} input
             * @constructor
             */
            constructor: function (input) {
                this._iStream = gpfI.query(input, gpfI.IReadableStream, true);
                this._buffer = [];
            },

            //region gpf.interfaces.IReadableStream

            /**
             * @implements gpf.interfaces.IReadableStream:read
             */
            read: function (size, eventsHandler) {
                var
                    iState = this._iState,
                    length = this._bufferLength;
                if (_BUFREADSTREAM_ISTATE_INPROGRESS === iState) {
                    // A read call is already in progress
                    throw gpfI.IReadableStream.EXCEPTION_READ_IN_PROGRESS;

                } else if (size < length
                    || length && _BUFREADSTREAM_ISTATE_EOS === iState) {
                    // Enough chars in the output buffer to do the read
                    // OR there won't be any more chars. Can output something.
                    gpf.events.fire.apply(this, [
                        gpfI.IReadableStream.EVENT_DATA,
                        {
                            buffer: this._readFromBuffer(size)
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
                    if (0 < this._bufferLength) {
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

    /**
     *
     * @param {gpf.interfaces.ITextStream} stream
     * @param {gpf.events.Handler} eventsHandler
     * @param {Function} concatMethod
     *
     * @forwardThis
     *
     * @event ready finished reading the stream
     * @eventParam {Array} array
     */
    gpf.stream.readAll = function (stream, concatMethod, eventsHandler) {
        stream = gpf.interfaces.query(stream, gpfI.IReadableStream,  true);
        (new StreamReader(this, eventsHandler, concatMethod)).read(stream);
    };

    function StreamReader(scope, eventsHandler, concatMethod) {
        this._scope = gpf.Callback.resolveScope(scope);
        this._eventsHandler = eventsHandler;
        this._concatMethod = concatMethod;
    }
    gpf.extend(StreamReader.prototype, {

        _scope: null,
        _eventsHandler: null,
        _concatMethod: null,
        _buffer: undefined,

        read: function (stream) {
            stream.read(0, gpf.Callback.bind(this, "callback"));
        },

        callback: function (event) {
            var
                type = event.type(),
                stream = event.scope();
            if (type === gpfI.IReadableStream.EVENT_END_OF_STREAM) {
                gpf.events.fire.apply(this._scope, [
                    gpfI.IReadableStream.EVENT_READY,
                    {
                        buffer: this._concatMethod(this._buffer)
                    },
                    this._eventsHandler
                ]);

            } else if (type === gpfI.IReadableStream.EVENT_ERROR) {
                // Forward the event
                gpf.events.fire.apply(this._scope, [
                    event,
                    this._eventsHandler
                ]);

            } else {
                this._buffer = this._concatMethod(this._buffer,
                    event.get("buffer"));
                this.read(stream);
            }
        }

    });

    //endregion

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/