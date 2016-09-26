/**
 * @file Custom class handler
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfProcessDefineParams*/ // Apply the default transformations on the define params
/*exported _gpfGenerateCustomDefineHandler*/ // Class handler for class types (interfaces...)
/*#endif*/

/**
 * Allocate a new class handler that is specific to a class type (used for interfaces & attributes)
 *
 * @param {String} rootNamespace Root namespace (for instance: gpf.interfaces)
 * @param {String} defaultSuperName Default super class (relative to rootNamespace, for instance: Interface)
 * @return {Function} With the same signature than {@link gpf.define} but namespace and base are defaulted
 * @closure
 */
function _gpfGenerateCustomDefineHandler (rootNamespace, defaultSuperName) {
    rootNamespace += ".";
    defaultSuperName = rootNamespace + defaultSuperName;

    return function (name, base, definition) {
        _gpfIgnore(name, base, definition);
        var params = [].slice.call(arguments);
        _gpfProcessDefineParams(rootNamespace, defaultSuperName, params);
        return _gpfDefine.apply(null, params);
    };
}
