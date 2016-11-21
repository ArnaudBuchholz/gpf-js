/**
 * @file Object merger
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _gpfExtend*/ // gpf.extend
/*#endif*/

/**
 * Used to assign member
 *
 * @param {*} value Value to assign to object
 * @param {String} memberName Member name
 * @this Object
 * @since 0.1.5
 */
function _gpfAssign (value, memberName) {
    /*jshint validthis:true*/
    this[memberName] = value;
}

/**
 * Extends the destination object by copying own enumerable properties from the source object.
 * If the member already exists, it is overwritten.
 *
 * @param {Object} destination Destination object
 * @param {...Object} source Source objects
 * @return {Object} Destination object
 * @since 0.1.5
 */
function _gpfExtend (destination, source) {
    _gpfIgnore(source);
    [].slice.call(arguments, 1).forEach(function (nthSource) {
        _gpfObjectForEach(nthSource, _gpfAssign, destination);
    });
    return destination;
}

/**
 * @gpf:sameas _gpfExtend
 * @since 0.1.5
 */
gpf.extend = _gpfExtend;
