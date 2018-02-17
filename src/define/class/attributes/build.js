/**
 * @file Build attributes in a class
 * @since 0.2.4
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_DEFINE_CLASS_ATTRIBUTES_SPECIFICATION*/ // $attributes
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfDefClassAttrIsAttributeSpecification*/ // Check if member name is an attribute
/*#endif*/

var _gpfDefClassAttrClassAddmemberToPrototype = _GpfClassDefinition.prototype._addMemberToPrototype,
    _gpfDefClassAttrClassBuildPrototype = _GpfClassDefinition.prototype._buildPrototype,
    _gpfDefClassAttrClassMemberName = "$" + _GPF_DEFINE_CLASS_ATTRIBUTES_SPECIFICATION;

Object.assign(_GpfClassDefinition.prototype, {

    /**
     * Dictionary of Attributes
     * @since 0.2.4
     */
    _attributes: {},

    _addAttributesFor: function (memberName, attributes) {
        this._attributes[memberName] = attributes;
    },

    /**
     * @inheritdoc
     * @since 0.2.4
     */
    _addMemberToPrototype: function (newPrototype, memberName, value) {
        var attributeName = _gpfDefClassAttrIsAttributeSpecification(memberName);
        if (attributeName) {
            this._addAttributesFor(attributeName, value);
        } else {
            _gpfDefClassAttrClassAddmemberToPrototype.call(this, newPrototype, memberName, value);
        }
    },

    /**
     * @inheritdoc
     * @since 0.2.4
     */
    _buildPrototype: function (newPrototype) {
        var classAttributes = this._initialDefinition[_gpfDefClassAttrClassMemberName];
        this._attributes = {};
        if (classAttributes) {
            this._addAttributesFor(_gpfDefClassAttrClassMemberName, classAttributes);
        }
        _gpfDefClassAttrClassBuildPrototype.call(this, newPrototype);
    }

});
