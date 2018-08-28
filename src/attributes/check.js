/**
 * @file Attributes validation helpers
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*exported _gpfAttributesCheckAppliedOnBaseClass*/ // Ensures attribute is applied on a specific base class
/*exported _gpfAttributesCheckClassOnly*/ // Ensures attribute is used only at class level
/*exported _gpfAttributesCheckMemberOnly*/ // Ensures attribute is used only at member level
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
    classAttributeOnly: "Class attribute only",

    /**
     * ### Summary
     *
     * Member attribute only
     *
     * ### Description
     *
     * A member attribute can't be assigned to a class
     */
    memberAttributeOnly: "Member attribute only",

    /**
    * ### Summary
    *
    * Restricted base class attribute
    *
    * ### Description
    *
    * The attribute is restricted to a given base class
    */
    restrictedBaseClassAttribute: "Restricted base class attribute"

});

/**
 * Ensures attribute is used only at class level
 *
 * @param {String} member Member name or empty if global to the class
 * @throws {gpf.Error.ClassAttributeOnly}
 */
function _gpfAttributesCheckClassOnly (member) {
    if (member) {
        gpf.Error.classAttributeOnly();
    }
}

/**
 * Ensures attribute is used only at member level
 *
 * @param {String} member Member name or empty if global to the class
 * @throws {gpf.Error.MemberAttributeOnly}
 */
function _gpfAttributesCheckMemberOnly (member) {
    if (!member) {
        gpf.Error.memberAttributeOnly();
    }
}

/**
 * Ensures attribute is applied on a specific base class
 *
 * @param {_GpfClassDefinition} classDefinition Class definition
 * @param {Function} ExpectedBaseClass Expected base class
 * @throws {gpf.Error.}
 */
function _gpfAttributesCheckAppliedOnBaseClass (classDefinition, ExpectedBaseClass) {
    if (!classDefinition._extend) {
        gpf.Error.restrictedBaseClassAttribute();
    }
    if (classDefinition._extend !== ExpectedBaseClass) {
        if (!(classDefinition._extend.prototype instanceof ExpectedBaseClass)) {
            gpf.Error.restrictedBaseClassAttribute();
        }
    }
}
