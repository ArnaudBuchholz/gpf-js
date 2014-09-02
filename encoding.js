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
        };

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

            }



        },

        createDecoder: function (input, encoding) {

        }
    };



}()); /* End of privacy scope */
