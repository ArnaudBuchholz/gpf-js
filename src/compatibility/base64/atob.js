/**
 * @file atob polyfill
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfBase64*/
/*exported _gpfAtob*/ // atob polyfill
/*#endif*/

var _gpfRegExpBase64 = /^(?:[A-Za-z\d+/]{4})*?(?:[A-Za-z\d+/]{2}(?:==)?|[A-Za-z\d+/]{3}=?)?$/;

function _gpfAtobCheckInput (encodedData) {
    var string = encodedData.replace(/[\t\n\f\r ]+/g, "");
    if (!_gpfRegExpBase64.test(string)) {
        throw new TypeError("The string to be decoded is not correctly encoded.");
    }
    return string;
}

function _gpfAtob (encodedData) {
    var string = _gpfAtobCheckInput(encodedData);
    string += "==".slice(2 - (string.length & 3));
    var bitmap, result = "", r1, r2, i = 0;
    for (; i < string.length;) {
        bitmap = _gpfBase64.indexOf(string.charAt(i++)) << 18 | _gpfBase64.indexOf(string.charAt(i++)) << 12
                 | (r1 = _gpfBase64.indexOf(string.charAt(i++))) << 6 | (r2 = _gpfBase64.indexOf(string.charAt(i++)));

        result += r1 === 64 ? String.fromCharCode(bitmap >> 16 & 255)
            : r2 === 64 ? String.fromCharCode(bitmap >> 16 & 255, bitmap >> 8 & 255)
                : String.fromCharCode(bitmap >> 16 & 255, bitmap >> 8 & 255, bitmap & 255);
    }
    return result;
}

/*#ifndef(UMD)*/

gpf.internals._gpfAtob = _gpfAtob;

/*#endif*/
