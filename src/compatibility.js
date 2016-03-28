/*#ifndef(UMD)*/
"use strict";
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfExtend*/ // gpf.extend
/*exported _gpfInstallCompatibility*/ // Define and install compatible methods
/*#endif*/

/*#ifndef(UMD)*/

/**
 * Polyfills for missing 'standard' methods
 *
 * @type {Object}
 */
var _gpfCompatibility = {};

/*#endif*/

/**
 * Define and install compatible methods
 *
 * @param {String} typeName
 * @param {Object} overrides Dictionary containing:
 * - {Function} on constructor to consider
 * - {Object} [methods=undefined] methods Dictionary of name to methods
 * - {Object} [statics=undefined] statics Dictionary of name to static functions
 * @private
 */
function _gpfInstallCompatibility (typeName, overrides) {
    var on = overrides.on;
/*#ifndef(UMD)*/
    _gpfCompatibility[typeName] = overrides;
/*#endif*/
    if (overrides.methods) {
        _gpfExtend(on.prototype, overrides.methods, _gpfEmptyFunc);
    }
    if (overrides.statics) {
        _gpfExtend(on, overrides.statics, _gpfEmptyFunc);
    }
}

/*#ifndef(UMD)*/

gpf.internals._gpfCompatibility = _gpfCompatibility;

/*#endif*/
