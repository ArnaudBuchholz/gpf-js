(function () { /* Begin of privacy scope */
    "use strict";
    /*global _gpfDefine*/ // Shortcut for gpf.define
    /*global _gpfErrorDeclare*/ // Declare new gpf.Error names

    _gpfErrorDeclare("encoding", {
        "EncodingNotSupported":
            "Encoding not supported",
        "EncodingEOFWithUnprocessedBytes":
            "Unexpected end of stream: unprocessed bytes"
    });

    var
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
                idx = 0,
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

        //region Encoder / Decoder stream implementation

        /**
         * Encoder stream
         *
         * @class gpf.encoding.EncoderStream
         * @extends gpf.stream.BufferedOnRead
         * @implements gpf.interfaces.IReadableStream
         * @private
         */
        EncoderStream = _gpfDefine("EncoderStream", gpf.stream.BufferedOnRead, {

            public: {

                /**
                 * @param {Function} encoder
                 * @param {gpf.interfaces.IReadableStream} input
                 * @constructor
                 */
                constructor: function (encoder, input) {
                    this._super(input);
                    this._encoder = encoder;
                }

            },

            protected: {

                /**
                 * @inheritdoc gpf.stream.BufferedOnRead:_addToBuffer
                 */
                _addToBuffer: function (buffer) {
                    this._buffer = this._buffer.concat(this._encoder(buffer));
                    this._bufferLength = this._buffer.length;
                },

                /**
                 * @inheritdoc gpf.stream.BufferedOnRead:_readFromBuffer
                 */
                _readFromBuffer:
                    gpf.stream.BufferedOnRead.prototype._readFromByteBuffer

            },

            private: {

                /**
                 * @type {Function}
                 * @private
                 */
                _encoder: null

            }

        }),

        /**
         * Decoder stream
         *
         * @class gpf.encoding.DecoderStream
         * @extends gpf.stream.BufferedOnRead
         * @implements gpf.interfaces.IReadableStream
         * @private
         */
        DecoderStream = _gpfDefine("DecoderStream", gpf.stream.BufferedOnRead, {

            public: {

                /**
                 * @param {Function} decoder
                 * @param {gpf.interfaces.IReadableStream} input
                 * @constructor
                 */
                constructor: function (decoder, input) {
                    this._super(input);
                    this._decoder = decoder;
                }

            },

            protected: {

                /**
                 * @inheritdoc gpf.stream.BufferedOnRead:_addToBuffer
                 */
                _addToBuffer: function (buffer) {
                    var string;
                    if (this._unprocessed.length) {
                        buffer = this._unprocessed.concat(buffer);
                    }
                    this._unprocessed = [];
                    string = this._decoder(buffer, this._unprocessed);
                    this._buffer.push(string);
                    this._bufferLength += string.length;
                },

                /**
                 * @inheritdoc gpf.stream.BufferedOnRead:_endOfInputStream
                 */
                _endOfInputStream: function () {
                    if (this._unprocessed.length) {
                        throw gpf.Error.EncodingEOFWithUnprocessedBytes();
                    }
                },

                /**
                 * @inheritdoc gpf.stream.BufferedOnRead:_readFromBuffer
                 */
                _readFromBuffer:
                    gpf.stream.BufferedOnRead.prototype._readFromStringBuffer

            },

            private: {

                /**
                 * @type {Function}
                 * @private
                 */
                _decoder: null,

                /**
                 * @type {Number[]}
                 * @private
                 */
                _unprocessed: []

            }

        });

    //endregion

    gpf.encoding = {

        UTF_8: "utf-8",

        /**
         * Create a encoder to convert an input text stream into an output
         * binary buffer.
         *
         * @param {gpf.interfaces.IReadableStream} input
         * @param {String} encoding
         * @return {gpf.interfaces.IReadableStream}
         */
        createEncoder: function (input, encoding) {
            var module = _encodings[encoding];
            if (undefined === module) {
                throw gpf.Error.EncodingNotSupported();
            }
            return new EncoderStream(module[0], input);
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
            var module = _encodings[encoding];
            if (undefined === module) {
                throw gpf.Error.EncodingNotSupported();
            }
            return new DecoderStream(module[1], input);
        }
    };

}()); /* End of privacy scope */
