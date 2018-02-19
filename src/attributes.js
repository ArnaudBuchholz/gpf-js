/**
 * @file gpf.attributes.get
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAttribute*/ // Shortcut for gpf.attributes.Attribute
/*#endif*/

/**
 * Get attributes defined for the object / $class
 *
 * @param {Object|Function} objectOrClass Object instance or class constructor
 * @param {gpf.attributes.Attribute} [baseAttributeClass] Base attribute class used to filter results
 * @return {Object} Dictionary of attributes grouped per members
 */
function _gpfAttributesGet (objectOrClass, baseAttributeClass) {
    
}

/** @gpf:sameas _gpfAttributesGet */
gpf.attributes.get = _gpfAttributesGet;
