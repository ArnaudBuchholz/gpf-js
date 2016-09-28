/**
 * @file AttributeClassOnly attributes
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfA*/ // gpf.attributes
/*global _gpfAttribute*/ // Shortcut for gpf.attributes.Attribute
/*global _gpfDefAttr*/ // gpf.define for attributes
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfGetClassDefinition*/ // Get GPF class definition for a constructor
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*#endif*/

_gpfErrorDeclare("attributes/attributes", {
    onlyForAttributeClass:
        "The attribute {attributeName} can be used only on an Attribute class",
    onlyOnClassForAttributeClass:
        "The attribute {attributeName} must be used on Class",
    classOnlyAttribute:
        "The attribute {attributeName} can be used only for Class",
    memberOnlyAttribute:
        "The attribute {attributeName} can be used only for members",
    uniqueAttributeConstraint:
        "Attribute {attributeName} already defined on {className}",
    uniqueMemberAttributeConstraint:
        "Attribute {attributeName} already defined on {className}::{memberName}"
});

/* istanbul ignore next */ // Abstract method
/**
 * Throws an exception if target attribute can't be applied to objPrototype
 *
 * @param {gpf.attributes.Attribute} targetAttribute
 * @param {Object} objPrototype
 */
function _GpfAttrOnlyCheck (targetAttribute, objPrototype) {
    _gpfIgnore(targetAttribute, objPrototype);
    throw gpf.Error.abstractMethod();
}

var
    /**
     * Restricts the usage of an attribute to an attribute class only
     *
     * @class gpf.attributes.AttrClassOnlyAttribute
     * @extends gpf.attributes.Attribute
     */
    _GpfAttrOnly = _gpfDefAttr("AttrClassOnlyAttribute", {
        "-": {

            /**
             * Return current attribute name
             *
             * @return {String}
             */
            _getAttributeName: function () {
                return _gpfGetClassDefinition(this.constructor)._name;
            },

            _checkTargetClassIsAttribute: function (objPrototype) {
                if (!(objPrototype instanceof _gpfAttribute)) {
                    throw gpf.Error.onlyForAttributeClass({
                        attributeName: this._getAttributeName()
                    });
                }
            },

            _checkMemberIsClass: function () {
                if (this._member !== "Class") {
                    throw gpf.Error.onlyOnClassForAttributeClass({
                        attributeName: this._getAttributeName()
                    });
                }
            }

        },

        "#": {

            _alterPrototype: function (objPrototype) {
                this._checkTargetClassIsAttribute(objPrototype);
                this._checkMemberIsClass();
            }

        }
    }),

    /**
     * Provide mechanism to validate the USE of an attribute
     *
     * @class gpf.attributes.AttrConstraintAttribute
     * @extends gpf.attributes.AttrClassOnlyAttribute
     */
    _gpfAttrConstraint = _gpfDefAttr("AttrConstraintAttribute", _GpfAttrOnly, {
        "~": {

            // Name used to remember the original _alterPrototype handler
            originalAlterPrototype: "_alterPrototype:checked"

        },
        "-": {

            /**
             * Check that all attribute constraints are respected before calling the original _alterPrototype
             *
             * @param {Object} objPrototype
             * @this {gpf.attributes.Attribute} the child class attribute
             */
            _checkAndAlterPrototype: function (objPrototype) {
                var me = this,
                    statics = _gpfA.AttrConstraintAttribute,
                    originalAlterPrototype = statics.originalAlterPrototype,
                    attributes = new _gpfA.Map(me);
                // Get constraints set for THIS attribute
                attributes.filter(_gpfAttrConstraint).forEach(function (constraintAttributes) {
                    constraintAttributes.forEach(function (attribute) {
                        attribute._check(me, objPrototype);
                    });
                });
                // OK, call _alterPrototype
                me[originalAlterPrototype](objPrototype);
            }

        },
        "#": {

            // @inheritdoc _GpfAttrOnlyCheck
            _check: _GpfAttrOnlyCheck,

            // @inheritdoc gpf.attributes.Attribute#_alterPrototype
            _alterPrototype: function (objPrototype) {
                var statics = _gpfA.AttrConstraintAttribute,
                    originalAlterPrototype = statics.originalAlterPrototype;

                // Inherited method will take care of checking attribute class
                this._super(objPrototype);

                /**
                 * Several constraint attributes might be defined, check if the _alterPrototype has already been
                 * overridden
                 */
                if (undefined === objPrototype[originalAlterPrototype]) {
                    objPrototype[originalAlterPrototype] = objPrototype._alterPrototype;
                    objPrototype._alterPrototype = this._checkAndAlterPrototype;
                }
            }

        }
    });

/**
 * Used on attribute classes to mark them as class attribute (i.e. they can't be used on members)
 *
 * @class gpf.attributes.ClassAttributeAttribute
 * @extends gpf.attributes.AttrConstraintAttribute
 * @alias gpf.$ClassAttribute
 */
_gpfDefAttr("$ClassAttribute", _gpfAttrConstraint, {
    "#": {

        // @inheritdoc gpf.attributes.AttrConstraintAttribute#_check
        _check: function (targetAttribute, objPrototype) {
            _gpfIgnore(objPrototype);
            if (targetAttribute._member !== "Class") {
                var attributeClass = targetAttribute.constructor,
                    attributeClassDef = _gpfGetClassDefinition(attributeClass);
                throw gpf.Error.classOnlyAttribute({
                    attributeName: attributeClassDef._name
                });
            }
        }

    }
});

/**
 * Used on attribute classes to mark them as member attribute (i.e. they can't be used on Class)
 *
 * @class gpf.attributes.MemberAttributeAttribute
 * @extends gpf.attributes.AttrConstraintAttribute
 * @alias gpf.$MemberAttribute
 */
_gpfDefAttr("$MemberAttribute", _gpfAttrConstraint, {
    "#": {

        // @inheritdoc gpf.attributes.AttrConstraintAttribute#_check
        _check: function (targetAttribute, objPrototype) {
            _gpfIgnore(objPrototype);
            if (targetAttribute._member === "Class") {
                var attributeClass = targetAttribute.constructor,
                    attributeClassDef = _gpfGetClassDefinition(attributeClass);
                throw gpf.Error.memberOnlyAttribute({
                    attributeName: attributeClassDef._name
                });
            }
        }
    }
});

/**
 * Used on attribute classes to mark them as unique through the class hierarchy or per member.
 * If one try to define it more than once, an error is raised
 *
 * @class gpf.attributes.UniqueAttributeAttribute
 * @extends gpf.attributes.AttrConstraintAttribute
 * @alias gpf.$UniqueAttribute
 */
_gpfDefAttr("$UniqueAttribute", _gpfAttrConstraint, {
    "-": {

        // The attribute is unique for the whole class when true or per member when false
        _classScope: true

    },
    "#": {

        // @inheritdoc gpf.attributes.AttrConstraintAttribute#_check
        _check: function (targetAttribute, objPrototype) {
            var objectClass,
                objectClassDef,
                objectClassAttributes,
                attributeClass,
                attributeClassDef,
                attributesInObj,
                member = targetAttribute._member;

            // Get object class definition & attributes
            objectClass = objPrototype.constructor;
            objectClassDef = _gpfGetClassDefinition(objectClass);
            objectClassAttributes = new _gpfA.Map(objectClass);

            // Get attribute class definition & attributes
            attributeClass = targetAttribute.constructor;
            attributeClassDef = _gpfGetClassDefinition(attributeClass);

            attributesInObj = objectClassAttributes.filter(attributeClass);

            // Don't forget that targetAttribute is already added to the object
            if (this._classScope) {
                if (1 < attributesInObj.getCount()) {
                    throw gpf.Error.uniqueAttributeConstraint({
                        attributeName: attributeClassDef._name,
                        className: objectClassDef._name
                    });
                }
            } else if (1 < attributesInObj.getMemberAttributes(member).getItemsCount()) {
                throw gpf.Error.uniqueMemberAttributeConstraint({
                    attributeName: attributeClassDef._name,
                    className: objectClassDef._name,
                    memberName: member
                });
            }
        }

    },
    "+": {

        /**
         * @param {Boolean} [classScope=true] classScope True to set limit to one instance per class (including
         * hierarchy) or false to limit to one instance per member.
         */
        constructor: function (classScope) {
            if (undefined !== classScope) {
                this._classScope = true === classScope;
            }
        }

    }
});
