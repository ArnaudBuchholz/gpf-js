/**
 * @file btoa polyfill
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_12_BITS*/ // 12
/*global _GPF_18_BITS*/ // 18
/*global _GPF_1_BYTE*/ // 1
/*global _GPF_2_BYTES*/ // 2
/*global _GPF_6_BITS*/ // 6
/*global _GPF_6_BITS_MASK*/ // 63
/*global _GPF_START*/ // 0
/*global _gpfBase64*/ // Base64 encoding string
/*global _gpfMaxUnsignedByte*/ // 255
/*exported _gpfBtoa*/ // btoa polyfill
/*#endif*/

var _GPF_BTOA_MAX_PADDING = 3;

function _gpfBtoaCheck (stringToEncode, index) {
    var value = stringToEncode.charCodeAt(index);
    if (value > _gpfMaxUnsignedByte) {
        throw new TypeError("The string to be encoded contains characters outside of the Latin1 range.");
    }
    return value;
}

function _gpfBtoa (stringToEncode) {
    var bitmap,
        a,
        b,
        c,
        result = "",
        index = 0,
        rest = stringToEncode.length % _GPF_BTOA_MAX_PADDING; // To determine the final padding
    for (; index < stringToEncode.length;) {
        a = _gpfBtoaCheck(stringToEncode, index++);
        b = _gpfBtoaCheck(stringToEncode, index++);
        c = _gpfBtoaCheck(stringToEncode, index++);
        bitmap = a << _GPF_2_BYTES | b << _GPF_1_BYTE | c;
        result += _gpfBase64.charAt(bitmap >> _GPF_18_BITS & _GPF_6_BITS_MASK)
                + _gpfBase64.charAt(bitmap >> _GPF_12_BITS & _GPF_6_BITS_MASK)
                + _gpfBase64.charAt(bitmap >> _GPF_6_BITS & _GPF_6_BITS_MASK)
                + _gpfBase64.charAt(bitmap & _GPF_6_BITS_MASK);
    }
    // If there's need of padding, replace the last 'A's with equal signs
    if (rest) {
        return result.slice(_GPF_START, rest - _GPF_BTOA_MAX_PADDING) + "===".substring(rest);
    }
    return result;
}

/*#ifndef(UMD)*/

gpf.internals._gpfBtoa = _gpfBtoa;

/*#endif*/
