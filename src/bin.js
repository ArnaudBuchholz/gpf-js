/**
 * @file Binary tools
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfALPHA*/ // Letters (uppercase)
/*global _gpfAlpha*/ // Letters (lowercase)
/*global _gpfDigit*/ // Digits
/*global _gpfMax31*/ // Max value on 31 bits
/*global _gpfMax32*/ // Max value on 32 bits
/*#endif*/

var _gpfB64 = _gpfALPHA + _gpfAlpha + _gpfDigit + "+/",
    _gpfB16 = "0123456789ABCDEF",
    _gpfBinZ = 987654321,
    _gpfBinW = (new Date()).getTime() & _gpfMax32;

//region _gpfToBaseANY

function _gpfGetBitLength (pow, length) {
    if (undefined === length) {
        return 32;
    }
    return length * pow;
}

function _gpfToBaseAnyEncodeUsingBitShifting (baseAndValue, pow, length) {
    var base = baseAndValue.base,
        value = baseAndValue.value,
        result = [],
        bits = _gpfGetBitLength(pow, length),
        mask,
        digit;
    mask = (1 << bits - pow) - 1;
    bits = (1 << pow) - 1;
    while (0 !== value) {
        digit = value & bits;
        result.unshift(base.charAt(digit));
        value = value >> pow & mask;
    }
    return result;
}

function _gpfToBaseAnyEncodeUsingModulo (baseAndValue) {
    var base = baseAndValue.base,
        value = baseAndValue.value,
        result = [],
        baseLength = base.length,
        digit;
    while (0 !== value) {
        digit = value % baseLength;
        result.unshift(base.charAt(digit));
        value = (value - digit) / baseLength;
    }
    return result;
}

function _gpfIsBitShiftable (baseAndValue, pow, length) {
    return -1 < pow && (undefined === length || length * pow <= 32);
}

function _gpfToBaseAnyEncode (baseAndValue, length) {
    var pow = gpf.bin.isPow2(baseAndValue.base.length);
    if (_gpfIsBitShiftable(baseAndValue, pow, length)) {
        // Good conditions to use bits masking & shifting, will work with negative values and will be faster
        return _gpfToBaseAnyEncodeUsingBitShifting(baseAndValue, pow, length);
    }
    return _gpfToBaseAnyEncodeUsingModulo(baseAndValue);
}

function _gpfToBaseAnyPad (result, totalLength, pad) {
    var padLength = pad.length,
        resultLength = result.length;
    while (resultLength < totalLength) {
        result.unshift(pad.charAt(resultLength++ % padLength));
    }
    return result;
}

/**
 * Encodes the value within the specified base.
 * Result string length can be defined (formattingOptions.length) and missing characters will be added from
 * formattingOptions.pad
 *
 * @param {String} base values
 * @param {Number} value to encode
 * @param {Object} formattingOptions
 * - {Number} [length=undefined] length of encoding
 * - {String} [pad="0"] pad
 * @return {String}
 */
function _gpfToBaseANY (base, value, formattingOptions) {
    var length = formattingOptions.length,
        paddingLength = length || 1,
        paddingChars = formattingOptions.pad || base.charAt(0);
    return _gpfToBaseAnyPad(_gpfToBaseAnyEncode({
        base: base,
        value: value
    }, length), paddingLength, paddingChars).join("");
}

//endregion

//region _gpfFromBaseANY

// Skip initial padding characters
function _gpfSkipPad (text, pad) {
    var idx = 0;
    while (idx < text.length && -1 !== pad.indexOf(text.charAt(idx))) {
        ++idx;
    }
    return idx;
}

/**
 * Decodes the text value using the specified base.
 *
 * @param {String} base
 * @param {String} text
 * @param {String} [pad=base.charAt(0)] pad
 * @return {Number}
 */
function _gpfFromBaseANY (base, text, pad) {
    var baseLength = base.length,
        result = 0,
        idx = _gpfSkipPad(text, pad || base.charAt(0));
    while (idx < text.length) {
        result = baseLength * result + base.indexOf(text.charAt(idx++));
    }
    return result;
}

//endregion

//region _gpfPow2

// Computes the power of 2, the slower way
function _gpfSlowerComputePow2 (n) {
    var result = _gpfMax32 + 1;
    n -= 31;
    while (--n) {
        result *= 2;
    }
    return result;
}

// Computes the power of 2, try bit shifting
function _gpfComputePow2 (n) {
    if (31 > n) {
        return 1 << n;
    }
    return _gpfSlowerComputePow2(n);
}

/**
 * Gives the power of 2
 *
 * @param {Number} n the power to get
 * @return {Number}
 */
function _gpfPow2 (n) {
    var result = _gpfPow2[n];
    if (result) {
        return result;
    }
    result = _gpfComputePow2(n);
    _gpfPow2[n] = result;
    return result;
}
_gpfPow2[31] = _gpfMax31 + 1;
_gpfPow2[32] = _gpfMax32 + 1;

//endregion

//region _gpfIsPow2

// Computes the log2 (knowing value is a pow of 2)
function _gpfComputeLog2 (value) {
    var result = 0;
    while (1 < value) {
        ++result;
        value /= 2;
    }
    return result;
}

/**
 * Check if the given value is a power of 2
 *
 * @param {Number} value the value to check
 * @return {Number} the power of 2 or -1
 */
function _gpfIsPow2 (value) {
    // http://en.wikipedia.org/wiki/Power_of_two
    if (0 < value && 0 === (value & value - 1)) {
        return _gpfComputeLog2(value);
    }
    return -1;
}

//endregion


gpf.bin = {

    // @inheritdoc _gpfPow2
    pow2: _gpfPow2,

    // @inheritdoc _gpfIsPow2
    isPow2: _gpfIsPow2,

    /**
     * Returns the hexadecimal encoding of value.
     *
     * @param {Number} value
     * @param {Number} length of encoding
     * @param {String} [pad="0"] pad
     * @return {String}
     */
    toHexa: function (value, length, pad) {
        return _gpfToBaseANY(_gpfB16, value, {
            length: length,
            pad: pad
        });
    },

    /**
     * Decodes the hexadecimal text value.
     *
     * @param {String} text
     * @param {String} [pad="0"] pad
     * @return {Number}
     */
    fromHexa: function (text, pad) {
        return _gpfFromBaseANY(_gpfB16, text, pad);
    },

    /**
     * Returns the base 64 encoding of value.
     *
     * @param {Number} value
     * @param {Number} length of encoding
     * @param {String} [pad="0"] pad
     * @return {String}
     */
    toBase64: function (value, length, pad) {
        return _gpfToBaseANY(_gpfB64, value, {
            length: length,
            pad: pad
        });
    },

    /**
     * Decodes the hexadecimal text value.
     *
     * @param {String} text
     * @param {String} [pad="0"] pad
     * @return {Number}
     */
    fromBase64: function (text, pad) {
        return _gpfFromBaseANY(_gpfB64, text, pad);
    },

    /**
     * Test if the value contains the bitmask.
     *
     * @param {Number} value
     * @param {Number} bitmask
     * @return {Boolean}
     */
    test: function /*gpf:inline*/ (value, bitmask) {
        return (value & bitmask) === bitmask;
    },

    /**
     * Clear the bitmask inside the value
     *
     * @param {Number} value
     * @param {Number} bitmask
     * @return {Number}
     */
    clear: function /*gpf:inline*/ (value, bitmask) {
        return value & ~bitmask;
    },

    /**
     * Generate a random number between 0 inclusive and pow2(32) exclusive
     *
     * @return {Number}
     * Based on:
     * http://en.wikipedia.org/wiki/Random_number_generation
     * http://stackoverflow.com/questions/521295/javascript-random-seeds
     */
    random: function () {
        _gpfBinZ = 36969 * (_gpfBinZ & 65535) + (_gpfBinZ >> 16) & _gpfMax32;
        _gpfBinW = 18000 * (_gpfBinW & 65535) + (_gpfBinW >> 16) & _gpfMax32;
        return ((_gpfBinZ << 16) + _gpfBinW & _gpfMax32) + _gpfMax31;
    }

};
