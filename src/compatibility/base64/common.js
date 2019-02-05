/**
 * @file Common to atob & btoa polyfills
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfALPHA*/ // Letters (uppercase)
/*global _gpfAlpha*/ // Letters (lowercase)
/*global _gpfDigit*/ // Digits
/*exported _GPF_12_BITS*/ // 12
/*exported _GPF_16_BITS*/ // 16
/*exported _GPF_18_BITS*/ // 18
/*exported _GPF_1_BYTE*/ // 1
/*exported _GPF_2_BYTES*/ // 2
/*exported _GPF_6_BITS*/ // 6
/*exported _GPF_6_BITS_MASK*/ // 63
/*exported _GPF_PADDING_CHAR*/ // 64
/*exported _gpfBase64*/ // Base64 encoding string
/*#endif*/

var _gpfBase64 = _gpfALPHA + _gpfAlpha + _gpfDigit + "+/=",
    _GPF_6_BITS_MASK = 63,
    _GPF_18_BITS = 18,
    _GPF_16_BITS = 18,
    _GPF_12_BITS = 12,
    _GPF_6_BITS = 6,
    _GPF_1_BYTE = 8,
    _GPF_2_BYTES = 16,
    _GPF_PADDING_CHAR = 64;

/*#ifndef(UMD)*/

// Generates an empty function to reflect the null complexity of this module
(function _gpfCompatibilityBase64Common () {}());

/*#endif*/
