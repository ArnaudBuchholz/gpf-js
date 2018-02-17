/*#ifndef(UMD)*/
"use strict";
/*global _gpfEncodings*/ // Encodings dictionary
/*exported _GPF_ENCODING_UTF_8*/
/*#endif*/

// UTF-8 encode/decode based on  http://www.webtoolkit.info/
function _gpfUtf8Encode (input) {
    var
        result = [],
        len = input.length,
        idx,
        charCode;
    for (idx = 0; idx < len; ++idx) {
        charCode = input.charCodeAt(idx);
        if (charCode < 128) {
            result.push(charCode);
        } else if (charCode > 127 && charCode < 2048) {
            result.push(charCode >> 6 | 192);
            result.push(charCode & 63 | 128);
        } else {
            result.push(charCode >> 12 | 224);
            result.push(charCode >> 6 & 63 | 128);
            result.push(charCode & 63 | 128);
        }
    }
    return result;
}

function _gpfUtf8Decode (input, unprocessed) {
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
        } else if (byte > 191 && byte < 224) {
            if (idx + 1 === len) {
                break;
            }
            byte2 = input[++idx];
            result.push(String.fromCharCode((byte & 31) << 6 | byte2 & 63));
        } else {
            if (idx + 2 >= len) {
                break;
            }
            byte2 = input[++idx];
            byte3 = input[++idx];
            result.push(String.fromCharCode((byte & 15) << 12 | (byte2 & 63) << 6 | byte3 & 63));
        }
        ++idx;
    }
    while (idx < len) {
        unprocessed.push(input[idx++]);
    }
    return result.join("");
}

var _GPF_ENCODING_UTF_8 = "utf-8";
gpf.encoding.UTF_8 = _GPF_ENCODING_UTF_8;
_gpfEncodings[_GPF_ENCODING_UTF_8] = [_gpfUtf8Encode, _gpfUtf8Decode];
