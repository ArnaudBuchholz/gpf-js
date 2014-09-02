(function () { /* Begin of privacy scope */
    "use strict";

    gpf.encoding = {};

    /**
     * encode (string input) : byte[]
     *
     * decode (byte[] input, byte[] unprocessed) : string
     */

    //region UTF-8
    // UTF-8 encode/decode based on  http://www.webtoolkit.info/

    var
        utf8 = {

            encode: function (input) {
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

            decode: function (input, unprocessed) {
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
            }

        };

    //endregion

}()); /* End of privacy scope */
