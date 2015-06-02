/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfI*/ // gpf.interfaces
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*#endif*/

_gpfErrorDeclare("stream", {
    ReadInProgress:
        "A read operation is already in progress",
    WriteInProgress:
        "A write operation is already in progress"
});

var
    _GPF_BUFREADSTREAM_READ_SIZE        = 256,
    _GPF_BUFREADSTREAM_ISTATE_INIT        = 0,
    _GPF_BUFREADSTREAM_ISTATE_INPROGRESS  = 1,
    _GPF_BUFREADSTREAM_ISTATE_WAITING     = 2,
    _GPF_BUFREADSTREAM_ISTATE_EOS         = 3;

gpf.stream = {

    /**
     *
     * @param {gpf.interfaces.IReadableStream} readable
     * @param {gpf.interfaces.IWritableStream} writable
     * @param {Object} [options=undefined] options
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event done The readable stream was written in the writable one
     */
    pipe: function (readable, writable, options, eventsHandler) {
        var
            scope = new StreamPipeScope(readable, writable, options,
                eventsHandler);
        scope.ready();
    }

};

//region gpf.stream.pipe implementation

/**
 * Creates a custom EventsHandler to sequence the calls to be made
 *
 * @param {gpf.interfaces.IReadableStream} readable
 * @param {gpf.interfaces.IWritableStream} writable
 * @param {Object} [options=undefined] options
 * @param {gpf.events.Handler} eventsHandler
 * @constructor
 */
function StreamPipeScope (readable, writable, options, eventsHandler) {
    this._readable = _gpfI.queryInterface(readable, _gpfI.IReadableStream,
        true);
    this._writable = _gpfI.queryInterface(writable, _gpfI.IWritableStream,
        true);
    if (undefined === eventsHandler) {
        this._options = {};
        this._eventsHandler = options;
    } else {
        this._options = options;
        this._eventsHandler = eventsHandler;
    }
    this.scope = this;
}

StreamPipeScope.prototype = {
    _readable: null,        // Readable stream
    _writable: null,        // Writable stream
    _options: null,         // Options
    _eventsHandler: null,   // Original events handler
    scope: null             // This eventsHandler scope
};

/**
 * ready event handler
 *
 * @param {gpf.Event} event
 */
StreamPipeScope.prototype.ready = function () {
    var chunkSize = this._options.chunkSize || 4096;
    this._readable.read(chunkSize, this);
};

/**
 * eos event handler
 *
 * @param {gpf.Event} event
 */
StreamPipeScope.prototype.eos = function (/*event*/) {
    gpfFireEvent("done", this._eventsHandler);
};

/**
 * data event handler
 *
 * @param {gpf.Event} event
 */
StreamPipeScope.prototype.data = function (event) {
    var buffer = event.get("buffer");
    this._writable.write(buffer, this);
};

/**
 * Any other event handler
 *
 * @param {gpf.Event} event
 */
StreamPipeScope.prototype["*"] = function (event) {
    // Forward to original handler (error or data)
    gpfFireEvent(event, this._eventsHandler);
};

//endregion

//region gpf.stream.Out

/**
 * console.log exposed as an output stream.
 * Line is buffered until the carriage return.
 *
 * @class gpf.stream.Out
 * @implements gpf.interfaces.IWritableStream
 */
gpf.define("gpf.stream.Out", {

    "[Class]": [gpf.$InterfaceImplement(_gpfI.IWritableStream)],

    public: {

        /**
         * @constructor
         */
        constructor: function () {
            this._buffer = [];
        },

        /**
         * @inheritdoc gpf.interfaces.IWritableStream:write
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

    private: {

        /**
         * Line buffer
         *
         * @type {String[]}
         * private
         */
        _buffer: [],

        /**
         * @inheritdoc gpf.interfaces.IWritableStream:write
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
            gpfFireEvent.apply(this, [
                _gpfI.IWritableStream.EVENT_READY,
                eventsHandler
            ]);
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
         * @inheritdoc gpf.interfaces.IWritableStream:write
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
            throw gpf.Error.NotImplemented();
        }

    }

});

//endregion

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

    "[Class]": [gpf.$InterfaceImplement(_gpfI.IReadableStream)],

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
        _readSize: _GPF_BUFREADSTREAM_READ_SIZE,

        /**
         * Process underlying stream buffer (this should grow the output
         * buffer)
         *
         * @param {Array} buffer
         * @abstract
         * @protected
         */
        _addToBuffer: function (buffer) {
            _gpfIgnore(buffer);
            throw gpf.Error.Abstract();
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
            this._bufferLength -= size;
            return this._buffer.splice(0, size);
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
            this._iStream = _gpfI.query(input, _gpfI.IReadableStream, true);
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
            if (_GPF_BUFREADSTREAM_ISTATE_INPROGRESS === iState) {
                // A read call is already in progress
                throw _gpfI.IReadableStream.EXCEPTION_READ_IN_PROGRESS;

            } else if (size < length
                || length && _GPF_BUFREADSTREAM_ISTATE_EOS === iState) {
                // Enough chars in the output buffer to do the read
                // OR there won't be any more chars. Can output something.
                if (0 === size || size > length) {
                    size = length;
                }
                gpfFireEvent.apply(this, [
                    _gpfI.IReadableStream.EVENT_DATA,
                    {
                        buffer: this._readFromBuffer(size)
                    },
                    eventsHandler
                ]);

            } else if (_GPF_BUFREADSTREAM_ISTATE_EOS === iState) {
                // No more input and output buffer is empty
                gpfFireEvent.apply(this, [
                    _gpfI.IReadableStream.EVENT_END_OF_STREAM,
                    eventsHandler
                ]);

            } else {
                // Read input
                if (_GPF_BUFREADSTREAM_ISTATE_INIT === this._iState) {
                    // Very first call, create callback for input reads
                    this._cbRead = new gpf.Callback(this._onRead, this);
                }
                this._iState = _GPF_BUFREADSTREAM_ISTATE_INPROGRESS;
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
        _iState: _GPF_BUFREADSTREAM_ISTATE_INIT,

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
            if (type === _gpfI.IReadableStream.EVENT_END_OF_STREAM) {
                this._iState = _GPF_BUFREADSTREAM_ISTATE_EOS;
                this._endOfInputStream();
                // Redirect to read with backed parameters
                return this.read(this._size, this._eventsHandler);

            } else if (type === _gpfI.IReadableStream.EVENT_ERROR) {
                // Forward the event
                gpfFireEvent.apply(this, [
                    event,
                    this._eventsHandler
                ]);

            } else {
                this._iState = _GPF_BUFREADSTREAM_ISTATE_WAITING;
                this._addToBuffer(event.get("buffer"));
                if (0 < this._bufferLength) {
                    // Redirect to read with backed parameters
                    return this.read(this._size, this._eventsHandler);
                } else {
                    // Try to read source again
                    this._iStream.read(_GPF_BUFREADSTREAM_READ_SIZE,
                        this._cbRead);
                }
            }
        }

    }

    //endregion
});

/**
 * Bit reader (count is expressed as bits)
 * Rely on a underlying byte stream reader
 *
 * @class gpf.stream.BitReader
 * @extend gpf.stream.BufferedOnRead
 * @implements gpf.interfaces.IReadableStream
 */
gpf.define("gpf.stream.BitReader", "gpf.stream.BufferedOnRead", {

    "[Class]": [gpf.$InterfaceImplement(_gpfI.IReadableStream)],

    //region Implementation

    protected: {

        /**
         * @inheritdoc gpf.stream.BufferedOnRead:_addToBuffer
         */
        _addToBuffer: function (buffer) {
            this._buffer = this._buffer.concat(buffer);
            this._bufferLength += buffer.length * 8; // Expressed in bits
        },

        /**
         * @inheritdoc gpf.stream.BufferedOnRead:_readFromBuffer
         */
        _readFromBuffer: function (size) {
            var
                buffer = this._buffer, // alias
                result = [],
                readBit = this._bit,
                readByte,
                writeBit = 0,
                writeByte = 0;
            readByte = buffer[0];
            while (0 < size) {
                --size; // Expressed in bits
                writeByte <<= 1;
                if (0 !== (readByte & readBit)) {
                    writeByte |= 1;
                }
                // Next read
                --this._bufferLength; // Because expressed in bits
                if (readBit === 1) {
                    // End of current byte, move to next one
                    buffer.shift();
                    readByte = buffer[0];
                    readBit = 128;
                } else {
                    readBit >>= 1;
                }
                // Next write
                if (writeBit === 7) {
                    result.push(writeByte);
                    writeByte = 0;
                    writeBit = 0;
                } else {
                    ++writeBit;
                }
            }
            if (writeBit !== 0) {
                result.push(writeByte);
            }
            this._bit = readBit;
            return result;
        }

    },

    private: {

        /**
         * Current bit cursor
         *
         * @type {Number}
         * @private
         */
        _bit: 128

    }

    //endregion

});

var
    /**
     * Base class used to fully read a stream
     *
     * @class AbstractStreamReader
     * @abstract
     * @private
     */
    AbstractStreamReader = gpf.define("AbstractStreamReader", {

        public: {

            constructor: function (scope, eventsHandler) {
                this._scope = gpf.Callback.resolveScope(scope);
                this._eventsHandler = eventsHandler;
            },

            read: function (stream) {
                stream.read(this._readSize,
                    gpf.Callback.bind(this, "callback"));
            }

        },

        protected: {

            _readSize: 0,

            _consolidateBuffer: function () {
                throw gpf.Error.Abstract();
            },

            _addBuffer: function (buffer) {
                _gpfIgnore(buffer);
                throw gpf.Error.Abstract();
            }
        },

        private: {

            _scope: null,
            _eventsHandler: null,

            callback: function (event) {
                var
                    type = event.type(),
                    stream = event.scope();
                if (type === _gpfI.IReadableStream.EVENT_END_OF_STREAM) {
                    gpfFireEvent.apply(this._scope, [
                        _gpfI.IReadableStream.EVENT_DATA,
                        {
                            buffer: this._consolidateBuffer()
                        },
                        this._eventsHandler
                    ]);

                } else if (type === _gpfI.IReadableStream.EVENT_ERROR) {
                    // Forward the event
                    gpfFireEvent.apply(this._scope, [
                        event,
                        this._eventsHandler
                    ]);

                } else {
                    this._addBuffer(event.get("buffer"));
                    this.read(stream);
                }
            }

        }

    }),

    StreamReader = gpf.define("StreamReader", AbstractStreamReader, {

        public: {

            constructor: function (scope, eventsHandler, concatMethod) {
                this._super(scope, eventsHandler);
                this._concatMethod = concatMethod;
            }

        },

        protected: {

            _consolidateBuffer: function () {
                return this._concatMethod(this._buffer);
            },

            _addBuffer: function (buffer) {
                this._buffer = this._concatMethod(this._buffer, buffer);
            }
        },

        private: {

            _buffer: undefined,
            _concatMethod: null

        }

    }),

    B64StreamReader = gpf.define("B64StreamReader", AbstractStreamReader, {

        public: {

            constructor: function (scope, eventsHandler) {
                this._super(scope, eventsHandler);
                this._buffer = [];
            }

        },

        protected: {

            _readSize: 6,

            _consolidateBuffer: function () {
                return this._buffer.join("");
            },

            _addBuffer: function (buffer) {
                this._buffer.push(gpf.bin.toBase64(buffer[0]));
            }

        },

        private: {

            _buffer: []

        }

    });

/**
 * Read the whole stream and concat the buffers using the provided handler
 *
 * @param {gpf.interfaces.ITextStream} stream
 * @param {Function} concatMethod
 * @param {gpf.events.Handler} eventsHandler
 *
 * @forwardThis
 *
 * @event data finished reading the stream, the buffer is provided
 * @eventParam {Array|String} buffer
 */
gpf.stream.readAll = function (stream, concatMethod, eventsHandler) {
    stream = gpf.interfaces.query(stream, _gpfI.IReadableStream,  true);
    (new StreamReader(this, eventsHandler, concatMethod)).read(stream);
};

/**
 * Read the whole stream and returns a base64 string
 *
 * @param {gpf.interfaces.ITextStream} stream
 * @param {gpf.events.Handler} eventsHandler
 *
 * @forwardThis
 *
 * @event data finished reading the stream, the buffer is provided
 * @eventParam {Array|String} buffer
 */
gpf.stream.readAllAsB64 = function (stream, eventsHandler) {
    stream = new gpf.stream.BitReader(stream);
    (new B64StreamReader(this, eventsHandler)).read(stream);
};

//endregion

//region NodeJS specific classes

if (_gpfInNode) {

    /**
     * Wraps a readable stream from NodeJS into a IReadableStream
     *
     * @class gpf.stream.NodeReadable
     * @implements gpf.interfaces.IReadableStream
     */
    gpf.define("gpf.node.ReadableStream", {

        "[Class]": [gpf.$InterfaceImplement(_gpfI.IReadableStream)],

        public: {

            /**
             * @param {stream.Readable} stream
             * @constructor
             */
            constructor: function (stream) {
                this._stream = stream;
                stream.on("end", gpf.Callback.bind(this, "_onEnd"));
                stream.on("error", gpf.Callback.bind(this, "_onError"));
            },

            /**
             * @inheritDoc gpf.interfaces.IReadableStream:read
             */
            "[read]": [gpf.$ClassEventHandler()],
            read: function (size, eventsHandler) {
                var chunk;
                // Used as a critical section to prevent concurrent reads
                if (null !== this._eventsHandler) {
                    // A read call is already in progress
                    throw _gpfI.IReadableStream.EXCEPTION_READ_IN_PROGRESS;
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
                this._stream.once("readable",
                    gpf.Callback.bind(this, "_onReadable"));
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
                gpf.events.fire("data", {
                    buffer: gpf.node.buffer2JsArray(chunk)
                }, this._getEventsHandler());
            },

            _onEnd: function () {
                gpf.events.fire("eos", this._getEventsHandler());
            },

            _onError: function (error) {
                gpf.events.fire("error", {
                    error: error
                }, this._getEventsHandler());
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
    gpf.define("gpf.node.WritableStream", {

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
            write: function (int8buffer, eventsHandler) {
                _gpfIgnore(int8buffer);
                _gpfIgnore(eventsHandler);
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
