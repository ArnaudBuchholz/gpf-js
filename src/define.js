/**
 * @file Class management
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*exported _gpfDefine*/ // Shortcut for gpf.define
/*#endif*/

/**
 * Defines a class
 * @param {Object} definition Class definition
 * @return {Function} New class constructor
 */
function _gpfDefine (definition) {
    _gpfIgnore(definition);
    // _gpfDefineCheckDefinition(definition);
    return function () {};
}

/**
 * @sameas _gpfDefine
 */
gpf.define = _gpfDefine;
