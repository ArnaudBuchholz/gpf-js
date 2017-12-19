/**
 * @file Buffer stream
 */
/**
 * Handles a buffered stream that depends on a read stream.
 * The way the underlying buffer is read and converted can be overridden
 * through the following protected APIs:
 * - _readSize
 * - _addToBuffer
 *
 * @class gpf.stream.BufferedOnRead
 * @abstract
 * @implements {gpf.interfaces.IReadableStream}
 */
_gpfDefine("gpf.stream.BufferedOnRead", {

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
            gpf.Error.abstract();
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
                _gpfEventsFire.call(this, _gpfI.IReadableStream.EVENT_DATA, {buffer: this._readFromBuffer(size)},
                    eventsHandler);

            } else if (_GPF_BUFREADSTREAM_ISTATE_EOS === iState) {
                // No more input and output buffer is empty
                _gpfEventsFire.call(this, _gpfI.IReadableStream.EVENT_END_OF_STREAM, eventsHandler);

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
                _gpfEventsFire.call(this, event, this._eventsHandler);

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
