/*#ifndef(UMD)*/
"use strict";
/*global _gpfAssert*/ // Assertion method
/*global _gpfExit*/ // Exit function
/*global _gpfExtend*/ // gpf.extend
/*exported _gpfNodeBuffer2JsArray*/ // Converts a NodeJS buffer into an int array
/*#endif*/

_gpfExtend(gpf, {

    /**
     * Shallow copy an object
     *
     * @param {Object} obj
     * @return {Object}
     */
    clone: function (obj) {
        // http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object/5344074#5344074
        return JSON.parse(JSON.stringify(obj));
    },

    /*
     * Find the first member of dictionary which value equals to value.
     *
     * @param {Object/array} dictionary
     * @param {*} value
     * @return {String/number/undefined} undefined if not found
     */
    test: function (dictionary, value) {
        var idx;
        if (dictionary instanceof Array) {
            idx = dictionary.length;
            while (idx > 0) {
                if (dictionary[--idx] === value) {
                    return idx;
                }
            }
        } else {
            for (idx in dictionary) {
                if (dictionary.hasOwnProperty(idx) && dictionary[idx] === value) {
                    return idx;
                }
            }
        }
        return undefined;
    },

    /*
     * Inserts the value in the array if not already present.
     *
     * @param {Array} array
     * @param {*} value
     * @return {Array}
     * @chainable
     */
    set: function (array, value) {
        _gpfAssert(array instanceof Array, "gpf.set must be used with an Array");
        var idx = array.length;
        while (idx > 0) {
            if (array[--idx] === value) {
                return array; // Already set
            }
        }
        array.push(value);
        return array;
    },

    /*
     * Removes the member of 'dictionary' which value equals 'value'.
     * NOTE: that the object is modified.
     *
     * @param {Object/array} dictionary
     * @param {*} value
     * @return {Object/array} dictionary
     * @chainable
     */
    clear: function (dictionary, value) {
        var idx;
        if (dictionary instanceof Array) {
            idx = dictionary.length;
            while (idx > 0) {
                if (dictionary[--idx] === value) {
                    dictionary.splice(idx, 1);
                    break;
                }
            }
        } else {
            for (idx in dictionary) {
                if (dictionary.hasOwnProperty(idx) && dictionary[idx] === value) {
                    delete dictionary[idx];
                }
            }
        }
        return dictionary;
    },

    /**
     * XOR
     *
     * @param {Boolean} a
     * @param {Boolean} b
     */
    xor: function (a, b) {
        return a && !b || !a && b;
    }

});


/* istanbul ignore next */ // Not testable
/**
 * Exit function
 *
 * @paran {Number} [exitCode=0] exitCode
 */
gpf.exit = function (exitCode) {
    if (undefined === exitCode) {
        exitCode = 0;
    }
    _gpfExit(exitCode);
};

//region NodeJS helpers

/**
 * Converts a NodeJS buffer into a native array containing unsigned
 * bytes
 *
 * @param {Buffer} buffer
 * @return {Number[]}
 */
function _gpfNodeBuffer2JsArray (buffer) {
    var result = [],
        len = buffer.length,
        idx;
    for (idx = 0; idx < len; ++idx) {
        result.push(buffer.readUInt8(idx));
    }
    return result;
}

//endregion

/*#ifndef(UMD)*/

gpf.internals._gpfNodeBuffer2JsArray = _gpfNodeBuffer2JsArray;

/*#endif*/
