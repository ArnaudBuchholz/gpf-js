/**
 * @file Attributes validation helpers
 * @since 0.2.8
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*exported _gpfAttributesCheckAppliedOnBaseClass*/ // Ensures attribute is applied on a specific base class
/*exported _gpfAttributesCheckClassOnly*/ // Ensures attribute is used only at class level
/*exported _gpfAttributesCheckMemberOnly*/ // Ensures attribute is used only at member level
/*#endif*/

_gpfErrorDeclare("attributes/check", {

    /**
     * ### Summary
     *
     * Class attribute only
     *
     * ### Description
     *
     * A class attribute can't be assigned to a member
     * @since 0.2.8
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
     * @since 0.2.8
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
    * @since 0.2.8
    */
    restrictedBaseClassAttribute: "Restricted base class attribute"

});

/**
 * Ensures attribute is used only at class level
 *
 * @param {String} member Member name or empty if global to the class
 * @throws {gpf.Error.ClassAttributeOnly}
 * @since 0.2.8
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
 * @since 0.2.8
 */
function _gpfAttributesCheckMemberOnly (member) {
    if (!member) {
        gpf.Error.memberAttributeOnly();
    }
}

function _gpfAttributesCheckAppliedOnBaseClassIsExtendInstanceOf (Extend, ExpectedBaseClass) {
    if (!(Extend.prototype instanceof ExpectedBaseClass)) {
        gpf.Error.restrictedBaseClassAttribute();
    }
}

function _gpfAttributesCheckAppliedOnBaseClassWithExtend (Extend, ExpectedBaseClass) {
    if (Extend !== ExpectedBaseClass) {
        _gpfAttributesCheckAppliedOnBaseClassIsExtendInstanceOf(Extend, ExpectedBaseClass);
    }
}

/**
 * Ensures attribute is applied on a specific base class
 *
 * @param {_GpfClassDefinition} classDefinition Class definition
 * @param {Function} ExpectedBaseClass Expected base class
 * @throws {gpf.Error.RestrictedBaseClassAttribute}
 * @since 0.2.8
 */
function _gpfAttributesCheckAppliedOnBaseClass (classDefinition, ExpectedBaseClass) {
    _gpfAttributesCheckAppliedOnBaseClassWithExtend(classDefinition._extend, ExpectedBaseClass);
}
