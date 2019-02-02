/**
 * @file atob polyfill
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfBase64*/
/*global _gpfMaxUnsignedByte*/
/*exported _gpfAtob*/ // atob polyfill
/*#endif*/

var _gpfRegExpBase64 = /^(?:[A-Za-z\d+/]{4})*?(?:[A-Za-z\d+/]{2}(?:==)?|[A-Za-z\d+/]{3}=?)?$/,
    _GPF_6_BITS = 6,
    _GPF_12_BITS = 12,
    _GPF_18_BITS = 18,
    _GPF_1_BYTE = 8,
    _GPF_2_BYTES = 16,
    _GPF_PADDING = 64;

function _gpfAtobCheckInput (encodedData) {
    var string = encodedData.replace(/[\t\n\f\r ]+/g, "");
    if (!_gpfRegExpBase64.test(string)) {
        throw new TypeError("The string to be decoded is not correctly encoded.");
    }
    return string;
}

function _gpfAtobDecodeLeadingBytes (bitmap, r2) {
    if (r2 === _GPF_PADDING) {
        return String.fromCharCode(bitmap >> _GPF_1_BYTE & _gpfMaxUnsignedByte);
    }
    return String.fromCharCode(bitmap >> _GPF_1_BYTE & _gpfMaxUnsignedByte, bitmap & _gpfMaxUnsignedByte);
}

function _gpfAtobDecode (bitmap, r1, r2) {
    var result = String.fromCharCode(bitmap >> _GPF_2_BYTES & _gpfMaxUnsignedByte);
    if (r1 !== _GPF_PADDING) {
        return result + _gpfAtobDecodeLeadingBytes(bitmap, r2);
    }
    return result;
}

function _gpfAtob (encodedData) {
    var input = _gpfAtobCheckInput(encodedData),
        length = input.length,
        index = 0,
        result = "",
        bitmap,
        r1,
        r2;
    input += "=="; // Pad leading bytes
    for (; index < length;) {
        bitmap = _gpfBase64.indexOf(input.charAt(index++)) << _GPF_18_BITS
                 | _gpfBase64.indexOf(input.charAt(index++)) << _GPF_12_BITS;
        r1 = _gpfBase64.indexOf(input.charAt(index++));
        r2 = _gpfBase64.indexOf(input.charAt(index++));
        bitmap |= r1 << _GPF_6_BITS | r2;
        result += _gpfAtobDecode(bitmap, r1, r2);
    }
    return result;
}

/*#ifndef(UMD)*/

gpf.internals._gpfAtob = _gpfAtob;

/*#endif*/
