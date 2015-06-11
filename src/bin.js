/*#ifndef(UMD)*/
"use strict";
/*global _gpfAlpha*/ // Letters (lowercase)
/*global _gpfALPHA*/ // Letters (uppercase)
/*global _gpfDigit*/ // Digits
/*global _gpfMax31*/ // Max value on 31 bits
/*global _gpfMax32*/ // Max value on 32 bits
/*#endif*/

var
    _gpfB64 = _gpfALPHA + _gpfAlpha + _gpfDigit + "+/",
    _gpfB16 = "0123456789ABCDEF",
    _gpfBinZ = 987654321,
    _gpfBinW = (new Date()).getTime() & _gpfMax32,

    _toBaseANY = function (base, value, length, safepad) {
        var
            baseLength = base.length,
            pow = gpf.bin.isPow2(baseLength),
            bits,
            mask,
            result = [],
            digit;
        if (-1 < pow && (undefined === length || length * pow <= 32)) {
            /*
             * Good conditions to use bits masking & shifting,
             * will work with negative values and will be faster
             */
            if (undefined === length) {
                bits = 32;
            } else {
                bits = length * pow;
            }
            mask = (1 << (bits - pow)) - 1;
            bits = (1 << pow) - 1;
            while (0 !== value) {
                digit = value & bits;
                result.unshift(base.charAt(digit));
                value = (value >> pow) & mask;
            }
        } else {
            while (0 !== value) {
                digit = value % baseLength;
                result.unshift(base.charAt(digit));
                value = (value - digit) / baseLength;
            }
        }
        if (undefined !== length) {
            if (undefined === safepad) {
                safepad = base.charAt(0);
            }
            while (result.length < length) {
                result.unshift(safepad.charAt(result.length % safepad.length));
            }
        } else if (0 === result.length) {
            result = [base.charAt(0)]; // 0
        }
        return result.join("");
    },

    _fromBaseANY = function (base, text, safepad) {
        var
            baseLength = base.length,
            result = 0,
            idx = 0;
        if (undefined === safepad) {
            safepad = base.charAt(0);
        }
        while (idx < text.length) {
            if (-1 === safepad.indexOf(text.charAt(idx))) {
                break;
            } else {
                ++idx;
            }
        }
        while (idx < text.length) {
            result = baseLength * result + base.indexOf(text.charAt(idx++));
        }
        return result;
    };

gpf.bin = {

    /**
     * Computes the power of 2
     *
     * @param {Number} n the power to compute
     * @return {Number}
     */
    pow2: function (n) {
        if (31 === n) {
            return _gpfMax31 + 1;
        }
        if (32 === n) {
            return _gpfMax32 + 1;
        }
        if (31 > n) {
            return 1 << n;
        }
        var result = _gpfMax32 + 1;
        n -= 31;
        while (--n) {
            result *= 2;
        }
        return result;
    },

    /**
     * Check if the given value is a power of 2
     *
     * @param {Number} value the value to check
     * @return {Number} the power of 2 or -1
     */
    isPow2: function (value) {
        // http://en.wikipedia.org/wiki/Power_of_two
        if (0 < value && (0 === (value & (value - 1)))) {
            var result = 0;
            while (1 < value) {
                ++result;
                value /= 2;
            }
            return result;
        } else {
            return -1;
        }
    },

    /**
     * Encodes the value within the specified base.
     * Result string length can be defined and missing characters will be
     * added with safepad.
     *
     * @param {String} base values
     * @param {Number} value to encode
     * @param {Number} length of encoding
     * @param {String} safepad [safepad=base.charAt(0)]
     * @return {String}
     */
    toBaseANY: _toBaseANY,

    /**
     * Decodes the text value using the specified base.
     * @param {String} base
     * @param {String} text
     * @param {String} safepad [safepad=""]
     * @return {Number}
     */
    fromBaseANY: _fromBaseANY,

    /**
     * Returns the hexadecimal encoding of value.
     * @param {Number} value
     * @param {Number} length of encoding
     * @param {String} safepad [safepad="0"]
     * @return {String}
     */
    toHexa: function (value, length, safepad) {
        return _toBaseANY(_gpfB16, value, length, safepad);
    },

    /**
     * Decodes the hexadecimal text value.
     * @param {String} text
     * @param {String} safepad [safepad="0"]
     * @return {Number}
     */
    fromHexa: function (text, safepad) {
        return _fromBaseANY(_gpfB16, text, safepad);
    },

    /**
     * Returns the base 64 encoding of value.
     * @param {Number} value
     * @param {Number} length of encoding
     * @param {String} safepad [safepad="0"]
     * @return {String}
     */
    toBase64: function (value, length, safepad) {
        return _toBaseANY(_gpfB64, value, length, safepad);
    },

    /**
     * Decodes the hexadecimal text value.
     * @param {String} text
     * @param {String} safepad [safepad="0"]
     * @return {Number}
     */
    fromBase64: function (text, safepad) {
        return _fromBaseANY(_gpfB64, text, safepad);
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
     * @returns {Number}
     * Based on:
     * http://en.wikipedia.org/wiki/Random_number_generation
     * http://stackoverflow.com/questions/521295/javascript-random-seeds
     */
    random: function () {
        _gpfBinZ = (36969 * (_gpfBinZ & 65535) + (_gpfBinZ >> 16)) & _gpfMax32;
        _gpfBinW = (18000 * (_gpfBinW & 65535) + (_gpfBinW >> 16)) & _gpfMax32;
        return (((_gpfBinZ << 16) + _gpfBinW) & _gpfMax32) + _gpfMax31;
    }

};