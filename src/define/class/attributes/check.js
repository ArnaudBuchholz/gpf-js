/**
 * @file Attributes management in a class
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfArrayForEach*/ // Almost like [].forEach (undefined are also enumerated)
/*global _gpfAttribute*/ // Shortcut for gpf.attributes.Attribute
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfIsArrayLike*/
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
     */
    invalidAttributesSpecification: "Invalid attributes specification"

});

//region define/class/check

var _GPF_DEFINE_CLASS_ATTRIBUTES_SPEFICIATION = "attributes",
    _gpfDefineClassAttributesClassCheckMemberName = _GpfClassDefinition.prototype._checkMemberName,
    _gpfDefineClassAttributesClassCheckMemberValue = _GpfClassDefinition.prototype._checkMemberValue,
    _gpfDefineClassAttributesClassCheck$Property = _GpfClassDefinition.prototype._check$Property;

Object.assign(_GpfClassDefinition.prototype, {

    /**
     * Given the member name, tells if the property introduces attributes
     *
     * @param {String} name Member name
     * @return {String|undefined} Real property name if attributes specification, undefined otherwise
     */
    _isAttributeSpecification: function (name) {
        var length = name.length;
        if (name.charAt(0) === "[" && name.charAt(length - 1) === "]") {
            return name.substr(1, length - 2);
        }
    },

    /**
     * Given the member name, tells if it exists
     *
     * @param {String} name property name
     * @throws {gpf.Error.unknownAttributesSpecification}
     */
    _checkMemberExist: function (name) {
        if ((!this._extend || this._extend.prototype[name] === undefined)
            && !this._initialDefinition.hasOwnProperty(name)) {
            gpf.Error.unknownAttributesSpecification();
        }
    },

    /** @inheritdoc */
    _checkMemberName: function (name) {
        var attributeName = this._isAttributeSpecification(name);
        if (attributeName) {
            _gpfDefineClassAttributesClassCheckMemberName.call(this, attributeName);
            this._checkMemberExist(attributeName);
        } else {
            _gpfDefineClassAttributesClassCheckMemberName.call(this, name);
        }
    },

    /**
     * Verify that the attributes specification fits the requirements:
     * - Must be an array
     * - The array must contain only instances of {@link gpf.attributes.Attribute}
     *
     * @param {*} attributes The attributes specification to validate
     * @throws {gpf.Error.InvalidAttributesSpecification}
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

    /** @inheritdoc */
    _checkMemberValue: function (name, value) {
        if (this._isAttributeSpecification(name)) {
            this._checkAttributesSpecification(value);
        } else {
            _gpfDefineClassAttributesClassCheckMemberValue.call(this, name, value);
        }
    },

    /** @inheritdoc */
    _check$Property: function (name, value) {
        if (_GPF_DEFINE_CLASS_ATTRIBUTES_SPEFICIATION === name) {
            this._checkAttributesSpecification(value);
        } else {
            _gpfDefineClassAttributesClassCheck$Property.call(this, name, value);
        }
    }

});

_GpfClassDefinition.prototype._allowed$Properties.push(_GPF_DEFINE_CLASS_ATTRIBUTES_SPEFICIATION);

//endregion
