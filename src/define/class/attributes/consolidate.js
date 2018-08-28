/**
 * @file Get attributes from a class definition
 * @since 0.2.4
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*#endif*/

function _gpfDefClassAttrFilter (attributes, baseAttributeClass) {
    if (baseAttributeClass) {
        return attributes.filter(function (attribute) {
            return attribute instanceof baseAttributeClass;
        });
    }
    return attributes;
}

function _gpfDefClassAttrAssign (allAttributes, member, attributes) {
    allAttributes[member] = (allAttributes[member] || []).concat(attributes);
}

Object.assign(_GpfClassDefinition.prototype, {

    _collectOwnAttributes: function (allAttributes, baseAttributeClass) {
        _gpfObjectForEach(this._attributes, function (memberAttributes, member) {
            var attributes = _gpfDefClassAttrFilter(memberAttributes, baseAttributeClass);
            if (attributes.length) {
                _gpfDefClassAttrAssign(allAttributes, member, attributes);
            }
        });
    },

    _getOwnAttributes: function () {
        var ownAttributes = {};
        this._collectOwnAttributes(ownAttributes);
        return ownAttributes;
    },

    _collectAttributes: function (allAttributes, baseAttributeClass) {
        this._collectOwnAttributes(allAttributes, baseAttributeClass);
        if (this._extendDefinition) {
            this._extendDefinition._collectAttributes(allAttributes, baseAttributeClass);
        }
    },

    /**
     * Retrieve all attributes for this class definition (including inherited ones)
     *
     * @param {gpf.attributes.Attribute} [baseAttributeClass] Base attribute class used to filter results
     * @return {Object} Dictionary of attributes grouped per members
     * @since 0.2.4
     */
    getAttributes: function (baseAttributeClass) {
        var allAttributes = {};
        this._collectAttributes(allAttributes, baseAttributeClass);
        return allAttributes;
    }

});
