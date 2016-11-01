/**
 * @file Polyfills installer
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _gpfInstallCompatibility*/ // Define and install compatible methods
/*#endif*/

/**
 * @typedef _GpfCompatibilityDescription
 * @property {Function} on Constructor where compatible members should be added if missing
 * @property {Object} methods Dictionary of named methods to add
 * @property {Object} statics Dictionary of named statics to add
 */

/*#ifndef(UMD)*/

/**
 * Dictionary of compatibility descriptions, indexed by constructor name
 *
 * @see {@link _GpfCompatibilityDescription}
 * @type {Object}
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
 * Define and install compatible methods
 *
 * @param {String} typeName Type name ("Object", "String"...)
 * @param {_GpfCompatibilityDescription} description Description of compatible methods
 */
function _gpfInstallCompatibility (typeName, description) {
    var on = description.on;
/*#ifndef(UMD)*/
    _gpfCompatibility[typeName] = description;
/*#endif*/
    _gpfInstallCompatibleMethods(on, description.methods);
    _gpfInstallCompatibleStatics(on, description.statics);
}

/*#ifndef(UMD)*/

gpf.internals._gpfCompatibility = _gpfCompatibility;

/*#endif*/
