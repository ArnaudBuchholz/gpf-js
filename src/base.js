/*#ifndef(UMD)*/
"use strict";
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
