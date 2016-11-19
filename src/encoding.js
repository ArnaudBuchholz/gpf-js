/**
 * @file Encoding helpers
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*exported _gpfEncodings*/
/*#endif*/

_gpfErrorDeclare("encoding", {
    "encodingNotSupported":
        "Encoding not supported",
    "encodingEOFWithUnprocessedBytes":
        "Unexpected end of stream: unprocessed bytes"
});

var
    /**
     * Map that relates encoding to the appropriate encoder/decoder
     *
     * encode (string input) : byte[]
     * decode (byte[] input, byte[] unprocessed) : string
     *
     * @type {Object}
     */
    _gpfEncodings = {},

    //region Encoder / Decoder stream implementation

    /**
     * Encoder stream
     *
     * @class gpf.encoding.EncoderStream
     * @extends gpf.stream.BufferedOnRead
     * @implements gpf.interfaces.IReadableStream
     */
    EncoderStream = _gpfDefine("EncoderStream", gpf.stream.BufferedOnRead, {
        "+": {

            /**
             * @param {Function} encoder
             * @param {gpf.interfaces.IReadableStream} input
             */
            constructor: function (encoder, input) {
                this._super(input);
                this._encoder = encoder;
            }

        },
        "#": {

            // @inheritdoc gpf.stream.BufferedOnRead#_addToBuffer
            _addToBuffer: function (buffer) {
                this._buffer = this._buffer.concat(this._encoder(buffer));
                this._bufferLength = this._buffer.length;
            },

            // @inheritdoc gpf.stream.BufferedOnRead#_readFromBuffer
            _readFromBuffer: gpf.stream.BufferedOnRead.prototype._readFromByteBuffer

        },
        "-": {

            // @property {Function}
            _encoder: null

        }
    }),

    /**
     * Decoder stream
     *
     * @class gpf.encoding.DecoderStream
     * @extends gpf.stream.BufferedOnRead
     * @implements gpf.interfaces.IReadableStream
     */
    DecoderStream = _gpfDefine("DecoderStream", gpf.stream.BufferedOnRead, {
        "+": {

            /**
             * @param {Function} decoder
             * @param {gpf.interfaces.IReadableStream} input
             */
            constructor: function (decoder, input) {
                this._super(input);
                this._decoder = decoder;
            }

        },
        "#": {

            // @inheritdoc gpf.stream.BufferedOnRead#_addToBuffer
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

            // @inheritdoc gpf.stream.BufferedOnRead#_endOfInputStream
            _endOfInputStream: function () {
                if (this._unprocessed.length) {
                    gpf.Error.encodingEOFWithUnprocessedBytes();
                }
            },

            // @inheritdoc gpf.stream.BufferedOnRead#_readFromBuffer
            _readFromBuffer: gpf.stream.BufferedOnRead.prototype._readFromStringBuffer

        },
        "-": {

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

    /**
     * Create a encoder to convert an input text stream into an output
     * binary buffer.
     *
     * @param {gpf.interfaces.IReadableStream} input
     * @param {String} encoding
     * @return {gpf.interfaces.IReadableStream}
     */
    createEncoder: function (input, encoding) {
        var module = _gpfEncodings[encoding];
        if (undefined === module) {
            gpf.Error.encodingNotSupported();
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
        var module = _gpfEncodings[encoding];
        if (undefined === module) {
            gpf.Error.encodingNotSupported();
        }
        return new DecoderStream(module[1], input);
    }
};
