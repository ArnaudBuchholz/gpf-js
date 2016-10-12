/**
 * @file Class / Member attribute placeholder definitions
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAssert*/ // Assertion method
/*global _gpfExtend*/ // gpf.extend
/*global _GpfClassDefinition*/ // GPF class definition
/*global _GpfClassDefMember*/ // GPF class member definition
/*#endif*/

//region Extension of _GpfClassDefinition

_gpfExtend(_GpfClassDefinition.prototype, /** @lends _GpfClassDefinition.prototype */ {

    /**
     * Class attributes
     *
     * @type {gpf.attributes.Attribute[]}
     */
    _attributes: [],

    /**
     * Collect class attributes
     *
     * @return {gpf.attributes.Attribute[]}
     */
    getClassAttributes: function () {
        return this._getSuperClassAttributes().concat(this._attributes);
    },

    _getSuperClassAttributes: function () {
        if (this._super) {
            return this._super.getClassAttributes();
        }
        return [];
    },

    /**
     * Add a class attribute
     *
     * @param {gpf.attributes.Attribute} attribute Class attribute to add
     * @chainable
     */
    addClassAttribute: function (attribute) {
        this._attributes = [];
        this.addClassAttribute = this._addClassAttribute;
        return this._addClassAttribute(attribute);
    },

    _addClassAttribute: function (attribute) {
        this._attributes.push(attribute);
        return this;
    },

    /**
     * Collect member attributes
     *
     * @param {String} name Member name
     * @return {gpf.attributes.Attribute[]}
     */
    getMemberAttributes: function (name) {
        var member = this._getOwnMember(name),
            superMemberAttributes = this._getSuperClassMemberAttributes(name);
        if (member) {
            return superMemberAttributes.concat(member.getAttributes());
        }
        return superMemberAttributes;
    },

    _getSuperClassMemberAttributes: function (name) {
        if (this._super) {
            return this._super.getMemberAttributes(name);
        }
        return [];
    },

    /**
     * Add a class member attribute
     *
     * @param {String} name Member name
     * @param {gpf.attributes.Attribute} attribute Class attribute to add
     * @chainable
     */
    addAttribute: function (name, attribute) {
        var member = this._getOwnMember(name);
        _gpfAssert(member, "Own member must exist");
        member.addAttribute(attribute);
        return this;
    }

});

//endregion Extension of _GpfClassDefinition

//region Extension of _GpfClassDefMember

_gpfExtend(_GpfClassDefMember.prototype, /** @lends _GpfClassDefMember.prototype */ {

    /**
     * Member attributes
     *
     * @type {gpf.attributes.Attribute[]}
     */
    _attributes: [],

    /**
     * Get member attributes
     * Only the ones defined for the owning class are retreived
     *
     * @return {gpf.attributes.Attribute[]}
     */
    getClassAttributes: function () {
        return this._attributes;
    }

});

//endregion Extension of _GpfClassDefMember
