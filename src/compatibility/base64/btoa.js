/**
 * @file btoa polyfill
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfBase64*/
/*exported _gpfBtoa*/ // btoa polyfill
/*#endif*/

// https://github.com/MaxArt2501/base64-js/blob/master/base64.js

function _gpfBtoaCheck (stringToEncode, index) {
    var value = stringToEncode.charCodeAt(index);
    if (value > 255) {
        throw new TypeError("The string to be encoded contains characters outside of the Latin1 range.");
    }
    return value;
}

function _gpfBtoa (stringToEncode) {
    var bitmap, a, b, c,
        result = "", i = 0,
        rest = stringToEncode.length % 3; // To determine the final padding
    for (; i < stringToEncode.length;) {
        a = _gpfBtoaCheck(stringToEncode, i++);
        b = _gpfBtoaCheck(stringToEncode, i++);
        c = _gpfBtoaCheck(stringToEncode, i++);
        bitmap = a << 16 | b << 8 | c;
        result += _gpfBase64.charAt(bitmap >> 18 & 63) + _gpfBase64.charAt(bitmap >> 12 & 63)
                + _gpfBase64.charAt(bitmap >> 6 & 63) + _gpfBase64.charAt(bitmap & 63);
    }
    // If there's need of padding, replace the last 'A's with equal signs
    if (rest) {
        return result.slice(0, rest - 3) + "===".substring(rest);
    }
    return result;
}

/*#ifndef(UMD)*/

gpf.internals._gpfBtoa = _gpfBtoa;

/*#endif*/
