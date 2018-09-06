/**
 * @file Attributes validation helpers
 * @since 0.2.8
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _GPF_DEFINE_CLASS_ATTRIBUTES_NAME*/
/*exported _gpfAttributesCheckAppliedOnBaseClass*/ // Ensures attribute is applied on a specific base class
/*exported _gpfAttributesCheckClassOnly*/ // Ensures attribute is used only at class level
/*exported _gpfAttributesCheckMemberOnly*/ // Ensures attribute is used only at member level
/*exported _gpfAttributesCheckAppliedOnlyOnce*/ // Ensures attribute is used only once
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
    * The attribute is restricted to a given base class, check the attribute documentation.
    * @since 0.2.8
    */
    restrictedBaseClassAttribute: "Restricted base class attribute",

    /**
    * ### Summary
    *
    * Unique attribute used twice
    *
    * ### Description
    *
    * The attribute is restricted to a single use
    */
    uniqueAttributeUsedTwice: "Unique attribute used twice"

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

/**
 * Ensures attribute is used only once
 *
 * @param {String} member Member name or empty if global to the class
 * @param {_GpfClassDefinition} classDefinition Class definition
 * @param {Function} AttributeClass Attribute class
 * @throws {gpf.Error.UniqueAttributeUsedTwice}
 */
function _gpfAttributesCheckAppliedOnlyOnce (member, classDefinition, AttributeClass) {
    var allAttributes = classDefinition.getAttributes(AttributeClass),
        attributes;
    if (member) {
        attributes = allAttributes[member] || [];
    } else {
        attributes = allAttributes[_GPF_DEFINE_CLASS_ATTRIBUTES_NAME] || [];
    }
    if (attributes.length > 1) {
        gpf.Error.uniqueAttributeUsedTwice();
    }
 }
