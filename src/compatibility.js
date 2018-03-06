/**
 * @file Polyfills installer
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfMainContext*/ // Main context object
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _gpfCompatibilityInstallGlobal*/ // Install compatible global if missing
/*exported _gpfCompatibilityInstallMethods*/ // Define and install compatible methods on standard objects
/*#endif*/

/**
 * @typedef _GpfCompatibilityDescription
 * @property {Function} on Constructor where compatible members should be added if missing
 * @property {Object} methods Dictionary of named methods to add
 * @property {Object} statics Dictionary of named statics to add
 * @since 0.1.5
 */

/*#ifndef(UMD)*/

/**
 * Dictionary of compatibility descriptions, indexed by constructor name
 *
 * @see {@link _GpfCompatibilityDescription}
 * @type {Object}
 * @since 0.1.5
 */
var _gpfCompatibility = {};

/*#endif*/

function _gpfInstallMissingMembers (on, members) {
    _gpfObjectForEach(members, function (value, memberName) {
        if (on[memberName] === undefined) {
            on[memberName] = value;
        }
    });
}

function _gpfInstallCompatibleMethods (on, methods) {
    if (methods) {
        _gpfInstallMissingMembers(on.prototype, methods);
    }
}

function _gpfInstallCompatibleStatics (on, statics) {
    if (statics) {
        _gpfInstallMissingMembers(on, statics);
    }
}

/**
 * Define and install compatible methods on standard objects
 *
 * @param {String} typeName Type name ("Object", "String"...)
 * @param {_GpfCompatibilityDescription} description Description of compatible methods
 * @since 0.1.5
 */
function _gpfCompatibilityInstallMethods (typeName, description) {
    var on = description.on;
    /*#ifndef(UMD)*/
    _gpfCompatibility[typeName] = description;
    /*#endif*/
    _gpfInstallCompatibleMethods(on, description.methods);
    _gpfInstallCompatibleStatics(on, description.statics);
}

/**
 * Install compatible global if missing
 *
 * @param {String} name Object name ("JSON", "Promise"...)
 * @param {*} polyfill Polyfill implementation of the object
 * @since 0.2.5
 */
function _gpfCompatibilityInstallGlobal (name, polyfill) {
    if (!_gpfMainContext[name]) {
        _gpfMainContext[name] = polyfill;
    }
}

/*#ifndef(UMD)*/

gpf.internals._gpfCompatibility = _gpfCompatibility;

/*#endif*/
