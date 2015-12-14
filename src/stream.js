/*#ifndef(UMD)*/
"use strict";
/*global _GPF_EVENT_ANY*/ // gpf.events.EVENT_ANY
/*global _GPF_EVENT_DATA*/ // gpf.events.EVENT_DATA
/*global _GPF_EVENT_END_OF_DATA*/ // gpf.events.EVENT_END_OF_DATA
/*global _GPF_EVENT_READY*/ // gpf.events.EVENT_READY
/*global _gpfAssert*/ // Assertion method
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _gpfI*/ // gpf.interfaces
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfResolveScope*/ // Translate the parameter into a valid scope
/*exported _gpfStreamPipe*/
/*#endif*/

_gpfErrorDeclare("stream", {
    readInProgress:
        "A read operation is already in progress",
    writeInProgress:
        "A write operation is already in progress"
});

var
    _GPF_BUFREADSTREAM_READ_SIZE          = 4096,
    _GPF_BUFREADSTREAM_ISTATE_INIT        = 0,
    _GPF_BUFREADSTREAM_ISTATE_INPROGRESS  = 1,
    _GPF_BUFREADSTREAM_ISTATE_WAITING     = 2,
    _GPF_BUFREADSTREAM_ISTATE_EOS         = 3;

//region gpf.stream.pipe

/**
 * @inheritdoc _gpfStreamPipe
 * @constructor
 */
function _GpfStreamPipe (configuration, eventsHandler) {
    /*jshint validthis:true*/ // constructor
    this._readable = _gpfI.queryInterface(configuration.readable, _gpfI.IReadableStream, true);
    this._writable = _gpfI.queryInterface(configuration.writable, _gpfI.IWritableStream, true);
    if (undefined !== configuration.chunkSize) {
        this.__chunkSize = configuration.chunkSize;
    }
    this._eventHandler = eventsHandler;
}

_GpfStreamPipe.prototype = {
    // @property {gpf.interfaces.IReadableStream} Read stream
    _readable: null,        // Readable stream
    // @property {gpf.interfaces.IWritableStream} Write stream
    _writable: null,        // Writable stream
    // @property {Number} Buffer size to read data
    _chunkSize: _GPF_BUFREADSTREAM_READ_SIZE,
    // @property {gpf.events.EventHandler} events handler
    _eventsHandler: null,   // Original
    // @property {_GpfStreamPipe} itself
    scope: null
};

// gpf.events.EVENT_READY event handler
_GpfStreamPipe.prototype[_GPF_EVENT_READY] = function (event) {
    _gpfIgnore(event);
    this._readable.read(this._chunkSize, this);
};

// gpf.events.EVENT_END_OF_DATA event handler
_GpfStreamPipe.prototype[_GPF_EVENT_END_OF_DATA] = function (event) {
    _gpfIgnore(event);
    _gpfEventsFire.apply(this, [_GPF_EVENT_READY, {}, this._eventsHandler]);
};

// gpf.events.EVENT_DATA event handler
_GpfStreamPipe.prototype[_GPF_EVENT_DATA] = function (event) {
    var buffer = event.get("buffer");
    this._writable.write(buffer, this);
};

// gpf.events.EVENT_ANY event handler
_GpfStreamPipe.prototype[_GPF_EVENT_ANY] = function (event) {
    // Forward to original handler (error or data)
    _gpfEventsFire.apply(this, [event, {}, this._eventsHandler]);
};

/**
 * Creates a pipe that transfer data from the readable stream to writable one
 *
 * @param {Object} configuration
 * - {gpf.interfaces.IReadableStream} readable The stream to read from
 * - {gpf.interfaces.IWritableStream} writable The stream to write to
 * - {Number} [chunkSize=_GPF_BUFREADSTREAM_READ_SIZE] chunkSize Chunk size
 * @param {gpf.events.Handler} eventsHandler
 *
 * @event ready
 * The readable stream was written in the writable one
 */
function _gpfStreamPipe (configuration, eventsHandler) {
    var scope = new _GpfStreamPipe(configuration, eventsHandler);
    scope.ready();
}

//endregion

gpf.stream = {

    pipe: _gpfStreamPipe

};

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
_gpfDefine("gpf.stream.BufferedOnRead", Object, {

    "[Class]": [gpf.$InterfaceImplement(_gpfI.IReadableStream)],

    //region Configurable part

    "#": {

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
            throw gpf.Error.abstract();
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
         * @return {String|Array}
         * @protected
         */
        _readFromBuffer: function (size) {
            _gpfAssert(0 !== this._buffer.length, "Buffer is not empty");
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
         * @return {String}
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
         * @return {Array}
         * @protected
         */
        _readFromByteBuffer: function (size) {
            this._bufferLength -= size;
            return this._buffer.splice(0, size);
        }

    },

    //endregion

    //region Implementation

    "+": {

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
                _gpfEventsFire.apply(this, [
                    _gpfI.IReadableStream.EVENT_DATA,
                    {
                        buffer: this._readFromBuffer(size)
                    },
                    eventsHandler
                ]);

            } else if (_GPF_BUFREADSTREAM_ISTATE_EOS === iState) {
                // No more input and output buffer is empty
                _gpfEventsFire.apply(this, [
                    _gpfI.IReadableStream.EVENT_END_OF_STREAM,
                    eventsHandler
                ]);

            } else {
                // Read input
                if (_GPF_BUFREADSTREAM_ISTATE_INIT === this._iState) {
                    // Very first call, create callback for input reads
                    this._cbRead = this._onRead.bind(this);
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

    "-": {

        /**
         * Input stream
         * @type {gpf.interfaces.IReadableStream}
         */
        _iStream: null,

        /**
         * Input stream read callback (pointing to this:_onRead)
         * @type {Function}
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
                _gpfEventsFire.apply(this, [
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
 * @extends gpf.stream.BufferedOnRead
 * @implements gpf.interfaces.IReadableStream
 */
_gpfDefine("gpf.stream.BitReader", "gpf.stream.BufferedOnRead", {

    "[Class]": [gpf.$InterfaceImplement(_gpfI.IReadableStream)],

    //region Implementation

    "#": {

        /**
         * @inheritdoc gpf.stream.BufferedOnRead#_addToBuffer
         */
        _addToBuffer: function (buffer) {
            this._buffer = this._buffer.concat(buffer);
            this._bufferLength += buffer.length * 8; // Expressed in bits
        },

        /**
         * @inheritdoc gpf.stream.BufferedOnRead#_readFromBuffer
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

    "-": {

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
    AbstractStreamReader = _gpfDefine("AbstractStreamReader", Object, {

        "+": {

            constructor: function (scope, eventsHandler) {
                this._scope = _gpfResolveScope(scope);
                this._eventsHandler = eventsHandler;
            },

            read: function (stream) {
                stream.read(this._readSize, this.callback.bind(this));
            }

        },

        "#": {

            _readSize: 0,

            _consolidateBuffer: function () {
                throw gpf.Error.abstract();
            },

            _addBuffer: function (buffer) {
                _gpfIgnore(buffer);
                throw gpf.Error.abstract();
            }
        },

        "-": {

            _scope: null,
            _eventsHandler: null,

            callback: function (event) {
                var
                    type = event.type(),
                    stream = event.scope();
                if (type === _gpfI.IReadableStream.EVENT_END_OF_STREAM) {
                    _gpfEventsFire.apply(this._scope, [
                        _gpfI.IReadableStream.EVENT_DATA,
                        {
                            buffer: this._consolidateBuffer()
                        },
                        this._eventsHandler
                    ]);

                } else if (type === _gpfI.IReadableStream.EVENT_ERROR) {
                    // Forward the event
                    _gpfEventsFire.apply(this._scope, [
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

    StreamReader = _gpfDefine("StreamReader", AbstractStreamReader, {

        "+": {

            constructor: function (scope, eventsHandler, concatMethod) {
                this._super(scope, eventsHandler);
                this._concatMethod = concatMethod;
            }

        },

        "#": {

            _consolidateBuffer: function () {
                return this._concatMethod(this._buffer);
            },

            _addBuffer: function (buffer) {
                this._buffer = this._concatMethod(this._buffer, buffer);
            }
        },

        "-": {

            _buffer: undefined,
            _concatMethod: null

        }

    }),

    B64StreamReader = _gpfDefine("B64StreamReader", AbstractStreamReader, {

        "+": {

            constructor: function (scope, eventsHandler) {
                this._super(scope, eventsHandler);
                this._buffer = [];
            }

        },

        "#": {

            _readSize: 6,

            _consolidateBuffer: function () {
                return this._buffer.join("");
            },

            _addBuffer: function (buffer) {
                this._buffer.push(gpf.bin.toBase64(buffer[0]));
            }

        },

        "-": {

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
