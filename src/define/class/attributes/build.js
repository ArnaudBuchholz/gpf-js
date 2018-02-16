/**
 * @file Build attributes in a class
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfDefineClassAttributesIsAttributeSpecification*/ // Check if member name is an attribute
/*global _GPF_DEFINE_CLASS_ATTRIBUTES_SPEFICIATION*/ // $attributes
/*#endif*/

var _gpfDefineClassAttributesClassAddmemberToPrototype = _GpfClassDefinition.prototype._addMemberToPrototype,
    _gpfDefineClassAttributesClassBuildPrototype = _GpfClassDefinition.prototype._buildPrototype;

Object.assign(_GpfClassDefinition.prototype, {

    /**
     * Dictionary of Attributes
     */
    _attributes: {},

    _addAttributesFor: function (memberName, attributes) {
        if (!this.hasOwnProperty(this._attributes)) {
            this._attributes = {};
        }
        this._attributes[memberName] = attributes;
    },

    /** @inheritdoc */
    _addMemberToPrototype: function (newPrototype, memberName, value) {
        var attributeName = _gpfDefineClassAttributesIsAttributeSpecification(memberName);
        if (attributeName) {
            this._addAttributesFor(attributeName, value);
        } else {
            _gpfDefineClassAttributesClassAddmemberToPrototype.call(this, newPrototype, memberName, value);
        }
    },

    /** @inheritdoc */
    _buildPrototype: function (newPrototype) {
        var classAttributesMember = "$" + _GPF_DEFINE_CLASS_ATTRIBUTES_SPEFICIATION,
            classAttributes = this._initialDefinition[classAttributesMember];
        if (classAttributes) {
            this._addAttributesFor(classAttributesMember, classAttributes);
        }
        _gpfDefineClassAttributesClassBuildPrototype.call(this, newPrototype);
    }

});
