(function () { /* Begin of privacy scope */
    "use strict";

    var
        gpfI = gpf.interfaces,

        //region UTF-8
        // UTF-8 encode/decode based on  http://www.webtoolkit.info/

        _utf8Encode = function (input) {
            var
                result = [],
                len = input.length,
                idx,
                charCode;
            for (idx = 0; idx < len; ++idx) {
                charCode = input.charCodeAt(idx);
                if (charCode < 128) {
                    result.push(charCode);
                } else if(charCode > 127 && charCode < 2048) {
                    result.push((charCode >> 6) | 192);
                    result.push((charCode & 63) | 128);
                } else {
                    result.push((charCode >> 12) | 224);
                    result.push(((charCode >> 6) & 63) | 128);
                    result.push((charCode & 63) | 128);
                }
            }
            return result;
        },

        _utf8Decode = function (input, unprocessed) {
            var
                result = [],
                len = input.length,
                idx,
                byte,
                byte2,
                byte3;
            while (idx < len) {
                byte = input[idx];
                if (byte < 128) {
                    result.push(String.fromCharCode(byte));
                } else if(byte > 191 && byte < 224) {
                    if (idx + 1 === len) {
                        break;
                    }
                    byte2 = input[++idx];
                    result.push(String.fromCharCode(((byte & 31) << 6)
                        | (byte2 & 63)));
                }
                else {
                    if (idx + 2 >= len) {
                        break;
                    }
                    byte2 = input[++idx];
                    byte3 = input[++idx];
                    result.push(String.fromCharCode(((byte & 15) << 12)
                        | ((byte2 & 63) << 6) | (byte3 & 63)));
                }
                ++idx;
            }
            while (idx < len) {
                unprocessed.push(input[idx++]);
            }
            return result.join("");
        },

        //endregion

        /**
         * Map that relates encoding to the appropriate encoder/decoder
         *
         * encode (string input) : byte[]
         * decode (byte[] input, byte[] unprocessed) : string
         *
         * @type {Object}
         * @private
         */
        _encodings = {
            "utf-8": [_utf8Encode, _utf8Decode]
        },

        /**
         * Encoder stream
         *
         * @class gpf.encoding.EncoderStream
         * @implements gpf.interfaces.IReadableStream
         * @private
         */
        EncoderStream = gpf.define("EncoderStream", {

            "[Class]": [gpf.$InterfaceImplement(gpfI.IReadableStream)],

            public: {

                /**
                 * @param {gpf.Parser} parser
                 * @param {gpf.interfaces.IReadableStream} input
                 */
                constructor: function (encoder, input) {
                    this._encoder = encoder;
                    this._iStream = input;
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
                    if (_PARSERSTREAM_ISTATE_INPROGRESS === iState) {
                        // A read call is already in progress
                        throw gpfI.IReadableStream.EXCEPTION_READ_IN_PROGRESS;

                    } else if (size < length
                        || length && _PARSERSTREAM_ISTATE_EOS === iState) {
                        // Enough chars in the output buffer to do the read
                        // OR there won't be any more chars
                        buffer = gpf.stringExtractFromStringArray(
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

                    } else if (_PARSERSTREAM_ISTATE_EOS === iState) {
                        // No more input and output buffer is empty
                        gpf.events.fire.apply(this, [
                            gpfI.IReadableStream.EVENT_END_OF_STREAM,
                            eventsHandler
                        ]);

                    } else {
                        // Read input
                        if (_PARSERSTREAM_ISTATE_INIT === this._iState) {
                            // Very first call, create callback for input reads
                            this._cbRead = new gpf.Callback(this._onRead, this);
                        }
                        this._iState = _PARSERSTREAM_ISTATE_INPROGRESS;
                        // Backup parameters
                        this._size = size;
                        this._eventsHandler = eventsHandler;
                        this._iStream.read(_PARSERSTREAM_BUFFER_SIZE, this._cbRead);
                    }
                }

                //endregion
            },

            //region Implementation

            private: {

                /**
                 * Parser
                 * @type {gpf.Parser}
                 */
                _parser: null,

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
                 * Output buffer, contains decoded items
                 * @type {String[]}
                 */
                _outputBuffer: [],

                /**
                 * Size of the output buffer (number of characters)
                 * @type {Number}
                 */
                _outputBufferLength: 0,

                /**
                 * Input state
                 * @type {Number} see _PARSERSTREAM_ISTATE_xxx
                 */
                _iState: _PARSERSTREAM_ISTATE_INIT,

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
                        this._iState = _PARSERSTREAM_ISTATE_EOS;
                        this._parser.parse(gpf.Parser.FINALIZE);
                        // Redirect to read with backed parameters
                        return this.read(this._size, this._eventsHandler);

                    } else if (type === gpfI.IReadableStream.EVENT_ERROR) {
                        // Forward the event
                        gpf.events.fire.apply(this, [
                            event,
                            this._eventsHandler
                        ]);

                    } else {
                        this._iState = _PARSERSTREAM_ISTATE_WAITING;
                        this._parser.parse(event.get("buffer"));
                        if (0 < this._outputBufferLength) {
                            // Redirect to read with backed parameters
                            return this.read(this._size, this._eventsHandler);
                        } else {
                            // Try to read source again
                            this._iStream.read(_PARSERSTREAM_BUFFER_SIZE,
                                this._cbRead);
                        }
                    }
                },

                /**
                 * Hook used in gpf.Parser:setOutputHandler
                 *
                 * @param {String} text
                 * @private
                 */
                _output: function (text) {
                    this._outputBuffer.push(text);
                    this._outputBufferLength += text.length;
                }

            }

            //endregion
        });

        //endregion

    gpf.encoding = {

        /**
         * Create a encoder to convert an input text stream into an output
         * binary buffer.
         *
         * @param {gpf.interfaces.IReadableStream} input
         * @param {String} encoding
         * @return {gpf.interfaces.IReadableStream}
         */
        createEncoder: function (input, encoding) {
            var iStream = gpfI.query(input, gpfI.IReadableStream, true),
                module = _encodings[encoding];
            if (undefined === module) {
                gpf.Error.EncodingNotSupported();
            }
            return new EncoderStream(module[0], iStream);
        },

        /**
         * Create a decoder to convert an input binary stream into an output
         * string.
         *
         * @param {gpf.interfaces.IReadableStream} input
         * @param {String} encoding
         * @return {gpf.interfaces.IReadableStream}
         */
        createDecoder: function (input, encoding) {
            var iStream = gpfI.query(input, gpfI.IReadableStream, true),
                module = _encodings[encoding];
            if (undefined === module) {
                gpf.Error.EncodingNotSupported();
            }
            return new gpf.encoding.DecoderStream(module[1], iStream);
        }
    };

}()); /* End of privacy scope */
