/*#ifndef(UMD)*/
"use strict";
/*global _gpfA*/ // gpf.attributes
/*global _gpfAttribute*/ // Shortcut for gpf.attributes.Attribute
/*global _gpfDefAttr*/ // gpf.define for attributes
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfGetClassDefinition*/ // Get GPF class definition for a constructor
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*#endif*/

_gpfErrorDeclare("a_attributes", {
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

var
    /**
     * Restricts the usage of an attribute to an attribute class only
     *
     * @class gpf.attributes.AttrClassOnlyAttribute
     * @extends gpf.attributes.Attribute
     */
    _GpfAttrOnly = _gpfDefAttr("AttrClassOnlyAttribute", {
        protected: {

            _alterPrototype: function (objPrototype) {
                if (!(objPrototype instanceof _gpfAttribute)) {
                    throw gpf.Error.onlyForAttributeClass({
                        attributeName: _gpfGetClassDefinition(this.constructor)._name
                    });
                }
                if (this._member !== "Class") {
                    throw gpf.Error.onlyOnClassForAttributeClass({
                        attributeName: _gpfGetClassDefinition(this.constructor)._name
                    });
                }
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
        static: {

            // Name used to remember the original _alterPrototype handler
            originalAlterPrototype: "_alterPrototype:checked"

        },
        private: {

            /**
             * Check that all attribute constraints are respected before calling the original _alterPrototype
             *
             * @param {Object} objPrototype
             * @this {gpf.attributes.Attribute} the child class attribute
             */
            _checkAndAlterPrototype: function (objPrototype) {
                var statics = _gpfA.AttrConstraintAttribute,
                    originalAlterPrototype = statics.originalAlterPrototype,
                    targetAttribute = this,
                    attributes = new _gpfA.Map(this);
                // Get constraints set for THIS attribute
                attributes.filter(_gpfAttrConstraint).forEach(function (constraintAttributes) {
                    constraintAttributes.forEach(function(attribute) {
                        attribute._check(targetAttribute, objPrototype);
                    });
                });
                // OK, call _alterPrototype
                targetAttribute[originalAlterPrototype](objPrototype);
            }

        },
        protected: {

            /**
             * Throws an exception if target attribute can't be applied to objPrototype
             *
             * @param {gpf.attributes.Attribute} targetAttribute
             * @param {Object} objPrototype
             */
            _check: function (targetAttribute, objPrototype) {
                _gpfIgnore(targetAttribute, objPrototype);
                throw gpf.Error.abstractMethod();
            },

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
    protected: {

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
    protected: {

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
    private: {

        // The attribute is unique for the whole class when true or per member when false
        _classScope: true

    },
    protected: {

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
    public: {

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
