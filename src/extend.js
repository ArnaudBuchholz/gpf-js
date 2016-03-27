/*#ifndef(UMD)*/
"use strict";
/*global _gpfAssert*/ // Assertion method
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _gpfExtend*/ // gpf.extend
/*#endif*/

/**
 * gpf.extend implementation of assign with no callback
 *
 * @param {*} value
 * @param {String} member
 */
function _gpfAssign (value, member) {
    /*jshint validthis:true*/ // gpf.extend's arguments: this[0] is dst
    this[0][member] = value;
}

/**
 * gpf.extend implementation of assign with a callback
 *
 * @param {*} value
 * @param {String} member
 */
function _gpfAssignOrCall (value, member) {
    /*jshint validthis:true*/ // gpf.extend's arguments
    var dst = this[0],
        overwriteCallback = this[2];
    // TODO: see if in is faster
    if (undefined === dst[member]) {
        dst[member] = value;
    } else {
        overwriteCallback(dst, member, value);
    }
}

/**
 * Extends the destination object dst by copying own enumerable properties from the src object(s) to dst.
 * If a conflict has to be handled (i.e. member exists on both objects), the overwriteCallback has to handle it.
 *
 * @param {Object} dst
 * @param {Object} src
 * @param {Function} [overwriteCallback=undefined] overwriteCallback
 * @return {Object} the modified dst
 * @chainable
 */
function _gpfExtend (dst, src, overwriteCallback) {
    var callbackToUse;
    if (undefined === overwriteCallback) {
        callbackToUse = _gpfAssign;
    } else {
        _gpfAssert("function" === typeof overwriteCallback, "Expected function");
        callbackToUse = _gpfAssignOrCall;
    }
    _gpfObjectForEach(src, callbackToUse, arguments); /*gpf:inline(object)*/
    return dst;
}

// @inheritdoc _gpfExtend
gpf.extend = _gpfExtend;
