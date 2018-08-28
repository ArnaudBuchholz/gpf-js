/**
 * @file Attributes validation helpers
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*exported _gpfAttributesCheckClassOnly*/ // Ensures attribute is used only at class level
/*#endif*/

_gpfErrorDeclare("xml/check", {

    /**
    * ### Summary
    *
    * Class attribute only
    *
    * ### Description
    *
    * A class attribute can't be assigned to a member
    */
    classAttributeOnly: "Class attribute only"

});

/**
 * Ensures attribute is used only at class level
 *
 * @param {String} member Member name or empty if global to the class
 * @throws {gpf.Error.ClassAttributeOnly}
 */
function _gpfAttributesCheckClassOnly (member) {
    if (memberName) {
        gpf.Error.classAttributeOnly();
    }
}
