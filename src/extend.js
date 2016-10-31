/**
 * @file Object merger
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAssert*/ // Assertion method
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _gpfExtend*/ // gpf.extend
/*#endif*/

/**
 * Callback function executed when a member must be overwritten.
 *
 * @callback gpfCallbackOverwriteMember
 *
 * @param {Object} object Destination object
 * @param {String} member Member name
 * @param {*} value Value to assign to member
 */

/**
 * gpf.extend implementation of assign with no callback
 *
 * @param {*} value Value to assign to member
 * @param {String} member Member name
 * @this Object
 */
function _gpfAssign (value, member) {
    /*jshint validthis:true*/
    this[0][member] = value;
}

/**
 * gpf.extend implementation of assign with a callback
 *
 * @param {*} value Value to assign to member
 * @param {String} member Member name
 * @this Object
 */
function _gpfAssignOrCall (value, member) {
    /*jshint validthis:true*/
    var dst = this[0],
        overwriteCallback = this[2];
    if (dst.hasOwnProperty(member)) {
        overwriteCallback(dst, member, value);
    } else {
        dst[member] = value;
    }
}

/**
 * Extends the destination object by copying own enumerable properties from the source object.
 * If a conflict has to be handled (i.e. member exists on both objects), the overwriteCallback has to handle it.
 *
 * @param {Object} destination Destination object
 * @param {Object} source Source object
 * @param {gpfCallbackOverwriteMember} [overwriteCallback] Overwrite callback
 * @return {Object} Destination object
 */
function _gpfExtend (destination, source, overwriteCallback) {
    var callbackToUse;
    if (undefined === overwriteCallback) {
        callbackToUse = _gpfAssign;
    } else {
        _gpfAssert("function" === typeof overwriteCallback, "Expected function");
        callbackToUse = _gpfAssignOrCall;
    }
    _gpfObjectForEach(source, callbackToUse, arguments);
    return destination;
}

/** @sameas _gpfExtend */
gpf.extend = _gpfExtend;
