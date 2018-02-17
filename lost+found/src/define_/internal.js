/**
 * @file Processing of internal gpf.define structures
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _gpfProcessInternalDefinition*/ // Process internal definition
/*#endif*/

var _gpfCleaningShortcuts = {
    "-": "private",
    "#": "protected",
    "+": "public",
    "~": "static"
};

// Replace the shortcut with the correct property name
function _gpfCleanDefinition (name, shortcut) {
    /*jshint validthis:true*/ // Bound to the definition below
    var shortcutValue = this[shortcut];
    if (undefined !== shortcutValue) {
        this[name] = shortcutValue;
        delete this[shortcut];
    }
}

/**
 * Process internal definition
 *
 * @param {Object} definition Internal definition with shortcuts
 * @returns {Object} Definition modified to fit core definition requirements
 */
function _gpfProcessInternalDefinition (definition) {
    _gpfObjectForEach(_gpfCleaningShortcuts, _gpfCleanDefinition, definition);
    return definition;
}
