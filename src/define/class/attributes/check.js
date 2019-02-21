/**
 * @file Check attributes definition in a class
 * @since 0.2.4
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfArrayForEach*/ // Almost like [].forEach (undefined are also enumerated)
/*global _gpfAttribute*/ // Shortcut for gpf.attributes.Attribute
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfIsArrayLike*/ // Return true if the parameter looks like an array
/*exported _GPF_DEFINE_CLASS_ATTRIBUTES_NAME*/ // $attributes
/*exported _gpfDefClassAttrIsAttributeSpecification*/ // Check if member name is an attribute
/*exported _gpfDefClassAttrCheck*/ // Check attribute
/*#endif*/

// Done as a feature 'on top' of normal class definition to be able to remove it easily

_gpfErrorDeclare("define/class/attributes", {

    /**
     * ### Summary
     *
     * The attributes are set on an unknwon member
     *
     * ### Description
     *
     * Attributes are allowed only on existing members or at the class level using $attributes
     * @since 0.2.4
     */
    unknownAttributesSpecification: "Unknown attributes specification",

    /**
     * ### Summary
     *
     * The attributes specification is invalid
     *
     * ### Description
     *
     * Attributes are specified using an array of {@link gpf.attributes.Attribute} instances
     * @since 0.2.4
     */
    invalidAttributesSpecification: "Invalid attributes specification"

});

var _GPF_DEFINE_CLASS_ATTRIBUTES_SPECIFICATION = "attributes",
    _GPF_DEFINE_CLASS_ATTRIBUTES_NAME = "$" + _GPF_DEFINE_CLASS_ATTRIBUTES_SPECIFICATION,
    // If matching the capturing group returns the member name or undefined (hence the |.)
    _gpfDefClassAttrIsAttributeRegExp = new RegExp("^\\[([^\\]]+)\\]$|."),
    _GPF_DEFINE_CLASS_ATTRIBUTE_MATCH_NAME = 1,
    _gpfDefClassAttrClassCheckMemberName = _GpfClassDefinition.prototype._checkMemberName,
    _gpfDefClassAttrClassCheckMemberValue = _GpfClassDefinition.prototype._checkMemberValue,
    _gpfDefClassAttrClassCheck$Property = _GpfClassDefinition.prototype._check$Property,
    _gpfDefClassAttrClassCheck = _GpfClassDefinition.prototype.check;

/**
 * Check attribute
 *
 * @param {String} member Member name
 * @param {gpf.attributes.Attribute} attribute Attribute
 * @this {_GpfClassDefinition}
 */
function _gpfDefClassAttrCheck (member, attribute) {
    /*jshint validthis:true*/
    attribute._check(member, this); //eslint-disable-line no-invalid-this
}

/**
 * Given the member name, tells if the property introduces attributes
 *
 * @param {String} name Member name
 * @return {String|undefined} Real property name if attributes specification, undefined otherwise
 * @since 0.2.4
 */
function _gpfDefClassAttrIsAttributeSpecification (name) {
    return _gpfDefClassAttrIsAttributeRegExp.exec(name)[_GPF_DEFINE_CLASS_ATTRIBUTE_MATCH_NAME];
}

Object.assign(_GpfClassDefinition.prototype, {

    _hasInheritedMember: function (name) {
        return this._extend && this._extend.prototype[name] !== undefined;
    },

    _hasMember: function (name) {
        return this._initialDefinition.hasOwnProperty(name)
            || this._hasInheritedMember(name);
    },

    /**
     * Given the member name, check if it exists
     *
     * @param {String} name property name
     * @throws {gpf.Error.unknownAttributesSpecification}
     * @since 0.2.4
     */
    _checkAttributeMemberExist: function (name) {
        if (!this._hasMember(name)) {
            gpf.Error.unknownAttributesSpecification();
        }
    },

    /**
     * @inheritdoc
     * @since 0.2.4
     */
    _checkMemberName: function (name) {
        var attributeName = _gpfDefClassAttrIsAttributeSpecification(name);
        if (attributeName) {
            _gpfDefClassAttrClassCheckMemberName.call(this, attributeName);
            this._checkAttributeMemberExist(attributeName);
        } else {
            _gpfDefClassAttrClassCheckMemberName.call(this, name);
        }
    },

    /**
     * Verify that the attributes specification fits the requirements:
     * - Must be an array
     * - The array must contain only instances of {@link gpf.attributes.Attribute}
     *
     * @param {*} attributes The attributes specification to validate
     * @throws {gpf.Error.InvalidAttributesSpecification}
     * @since 0.2.4
     */
    _checkAttributesSpecification: function (attributes) {
        if (!_gpfIsArrayLike(attributes)) {
            gpf.Error.invalidAttributesSpecification();
        }
        _gpfArrayForEach(attributes, function (attribute) {
            if (!(attribute instanceof _gpfAttribute)) {
                gpf.Error.invalidAttributesSpecification();
            }
        });
    },

    /**
     * @inheritdoc
     * @since 0.2.4
     */
    _checkMemberValue: function (name, value) {
        var attributeName = _gpfDefClassAttrIsAttributeSpecification(name);
        if (attributeName) {
            this._checkAttributesSpecification(value);
            this._addAttributesFor(attributeName, value);
        } else {
            _gpfDefClassAttrClassCheckMemberValue.call(this, name, value);
        }
    },

    /**
     * @inheritdoc
     * @since 0.2.4
     */
    _check$Property: function (name, value) {
        if (_GPF_DEFINE_CLASS_ATTRIBUTES_SPECIFICATION === name) {
            this._checkAttributesSpecification(value);
            this._addAttributesFor(_GPF_DEFINE_CLASS_ATTRIBUTES_NAME, value);
        } else {
            _gpfDefClassAttrClassCheck$Property.call(this, name, value);
        }
    },

    /**
     * @inheritdoc
     * @since 0.2.8
     */
    check: function () {
        this._attributes = {};
        _gpfDefClassAttrClassCheck.call(this);
        this._forOwnAttributes(_gpfDefClassAttrCheck);
    }

});

_GpfClassDefinition.prototype._allowed$Properties.push(_GPF_DEFINE_CLASS_ATTRIBUTES_SPECIFICATION);
