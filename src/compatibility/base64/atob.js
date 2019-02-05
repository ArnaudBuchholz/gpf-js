/**
 * @file atob polyfill
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_12_BITS*/ // 12
/*global _GPF_18_BITS*/ // 18
/*global _GPF_1_BYTE*/ // 1
/*global _GPF_2_BYTES*/ // 2
/*global _GPF_6_BITS*/ // 6
/*global _GPF_PADDING_CHAR*/ // 64
/*global _gpfBase64*/ // Base64 encoding string
/*global _gpfMaxUnsignedByte*/ // 255
/*exported _gpfAtob*/ // atob polyfill
/*#endif*/

var _gpfRegExpBase64 = /^(?:[A-Za-z\d+/]{4})*?(?:[A-Za-z\d+/]{2}(?:==)?|[A-Za-z\d+/]{3}=?)?$/,
    _GPF_ATOB_INDEX_INCREMENT = 4;

function _gpfAtobCheckInput (encodedData) {
    var string = encodedData.replace(/[\t\n\f\r ]+/g, "");
    if (!_gpfRegExpBase64.test(string)) {
        throw new TypeError("The string to be decoded is not correctly encoded.");
    }
    return string;
}

function _gpfAtobDecodeLeadingBytes (bitmap, r2) {
    if (r2 === _GPF_PADDING_CHAR) {
        return String.fromCharCode(bitmap >> _GPF_1_BYTE & _gpfMaxUnsignedByte);
    }
    return String.fromCharCode(bitmap >> _GPF_1_BYTE & _gpfMaxUnsignedByte, bitmap & _gpfMaxUnsignedByte);
}

function _gpfAtobDecode (bitmap, r1, r2) {
    var result = String.fromCharCode(bitmap >> _GPF_2_BYTES & _gpfMaxUnsignedByte);
    if (r1 !== _GPF_PADDING_CHAR) {
        return result + _gpfAtobDecodeLeadingBytes(bitmap, r2);
    }
    return result;
}

function _gpfAtobTranslate (input, index) {
    return _gpfBase64.indexOf(input.charAt(index));
}

function _gpfAtobRead (input, from) {
    var index = from,
        bitmap,
        r1,
        r2;
    bitmap = _gpfAtobTranslate(input, index++) << _GPF_18_BITS
             | _gpfAtobTranslate(input, index++) << _GPF_12_BITS;
    r1 = _gpfAtobTranslate(input, index++);
    r2 = _gpfAtobTranslate(input, index++);
    bitmap |= r1 << _GPF_6_BITS | r2;
    return _gpfAtobDecode(bitmap, r1, r2);
}

function _gpfAtob (encodedData) {
    var input = _gpfAtobCheckInput(encodedData),
        length = input.length,
        index = 0,
        result = "";
    input += "=="; // Pad leading bytes
    for (; index < length; index += _GPF_ATOB_INDEX_INCREMENT) {
        result += _gpfAtobRead(input, index);
    }
    return result;
}

/*#ifndef(UMD)*/

gpf.internals._gpfAtob = _gpfAtob;

/*#endif*/
