/**
 * @file Build attributes in a class
 * @since 0.2.4
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfDefClassAttrIsAttributeSpecification*/ // Check if member name is an attribute
/*global _gpfDefineGetEntityFromBuilder*/ // Retrieves entity definition from instance instance builder
/*#endif*/

var _gpfDefClassAttrClassAddmemberToPrototype = _GpfClassDefinition.prototype._addMemberToPrototype,
    _gpfDefClassAttrClassBuildPrototype = _GpfClassDefinition.prototype._buildPrototype;

function _gpfDefClassAttrBuild (member, attribute, newPrototype) {
    /*jshint validthis:true*/
    var attributeEntityDefinition = _gpfDefineGetEntityFromBuilder(attribute.constructor);
    if (!attributeEntityDefinition._singleton) {
        attribute._memberName = member;
        attribute._ClassConstructor = newPrototype.constructor;
    }
    attribute._build(member, this, newPrototype); //eslint-disable-line no-invalid-this
}

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
    },

    _buildPrototype: function (newPrototype) {
        _gpfDefClassAttrClassBuildPrototype.call(this, newPrototype);
        this._forOwnAttributes(_gpfDefClassAttrBuild, newPrototype);
    }

});
