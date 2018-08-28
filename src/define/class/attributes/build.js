/**
 * @file Build attributes in a class
 * @since 0.2.4
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfDefClassAttrIsAttributeSpecification*/ // Check if member name is an attribute
/*#endif*/

var _gpfDefClassAttrClassAddmemberToPrototype = _GpfClassDefinition.prototype._addMemberToPrototype;

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
        if (!attributeName) {
            _gpfDefClassAttrClassAddmemberToPrototype.call(this, newPrototype, memberName, value);
        }
    }

});
