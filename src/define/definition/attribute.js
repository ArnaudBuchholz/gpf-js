/**
 * @file Class / Member attributes placeholder definitions
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefMember*/ // GPF class member definition
/*global _GpfClassDefinition*/ // GPF class definition
/*global _gpfAssert*/ // Assertion method
/*global _gpfExtend*/ // gpf.extend
/*#endif*/

/**
 * @param {gpf.attributes.Attribute|gpf.attributes.Attribute[]} attributes Attributes
 * @returns {gpf.attributes.Attribute[]} Attribute array
 */
function _gpfToAttributeArray (attributes) {
    if (attributes instanceof Array) {
        return attributes;
    }
    return [attributes];
}

//region Extension of _GpfClassDefinition

_gpfExtend(_GpfClassDefinition.prototype, /** @lends _GpfClassDefinition.prototype */ {

    /**
     * Class attributes
     *
     * @type {gpf.attributes.Attribute[]}
     */
    _attributes: [],

    /**
     * Consolidate class attributes
     *
     * @return {gpf.attributes.Attribute[]} Array of attributes
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
     * Add class attributes
     *
     * @param {gpf.attributes.Attribute|gpf.attributes.Attribute[]} attributes Class attributes to add
     * @chainable
     */
    addClassAttributes: function (attributes) {
        this._attributes = [];
        this.addClassAttributes = this._addClassAttributes;
        return this._addClassAttributse(attributes);
    },

    _addClassAttributes: function (attributes) {
        this._attributes = this._attributes.concat(_gpfToAttributeArray(attributes));
        return this;
    },

    /**
     * Consolidate member attributes
     *
     * @param {String} name Member name
     * @return {gpf.attributes.Attribute[]} Array of attributes
     */
    getMemberAttributes: function (name) {
        var member = this.getOwnMember(name),
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
     * Add member attributes
     *
     * @param {String} name Member name
     * @param {gpf.attributes.Attribute|gpf.attributes.Attribute[]} attributes Attributes to add
     * @chainable
     */
    addAttributes: function (name, attributes) {
        var member = this.getOwnMember(name);
        _gpfAssert(member, "Own member must exist");
        member.addAttributes(attributes);
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
     * Only the ones defined for the owning class are retrieved
     *
     * @return {gpf.attributes.Attribute[]} Array of attributes
     */
    getAttributes: function () {
        return this._attributes;
    },

    /**
     * Add attributes
     *
     * @param {gpf.attributes.Attribute|gpf.attributes.Attribute[]} attributes Attributes to add
     * @chainable
     */
    addAttributes: function (attributes) {
        this._attributes = [];
        this.addAttributes = this._addAttributes;
        return this._addClassAttribute(attributes);
    },

    _addAttributes: function (attributes) {
        this._attributes = this._attributes.concat(_gpfToAttributeArray(attributes));
        return this;
    }

});

//endregion Extension of _GpfClassDefMember
