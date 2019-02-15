/**
 * @file ES6 decorator implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfArraySlice*/
/*global _gpfIgnore*/
/*#endif*/

/**
 * Get attributes defined for the object / class
 *
 * @param {...gpf.attributes.Attribute} attribute Attributes to add
 * @return {Function} decorator function
 * @throws {gpf.Error.InvalidParameter}
 */
function _gpfAttributesDecorator () {
    var attributes = _gpfArraySlice(arguments);
    return function (ClassConstructor, member/*, descriptor*/) {
        attributes.forEach(function (attribute) {
            // Add attribute
            _gpfIgnore(ClassConstructor, member, attribute);
        });
    };
}

/**
 * @gpf:sameas _gpfAttributesDecorator
 */
gpf.attributes.decorator = _gpfAttributesDecorator;
