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
