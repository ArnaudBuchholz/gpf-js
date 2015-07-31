/*#ifndef(UMD)*/
"use strict";
/*global _gpfA*/ // gpf.attributes
/*global _gpfDefAttr*/ // gpf.define for attributes
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfGetClassDefinition*/ // Get GPF class definition for a constructor
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*#endif*/

_gpfErrorDeclare("a_attributes", {
    OnlyForAttributeClass:
        "The attribute {attributeName} can be used only on an Attribute class",
    OnlyOnClassForAttributeClass:
        "The attribute {attributeName} must be used on Class",
    ClassOnlyAttribute:
        "The attribute {attributeName} can be used only for Class",
    MemberOnlyAttribute:
        "The attribute {attributeName} can be used only for members",
    UniqueAttributeConstraint:
        "Attribute {attributeName} already defined on {className}",
    UniqueMemberAttributeConstraint:
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
                if (!(objPrototype instanceof _gpfA.Attribute)) {
                    throw gpf.Error.OnlyForAttributeClass({
                        attributeName: _gpfGetClassDefinition(this.constructor).name()
                    });
                }
                if (this._member !== "Class") {
                    throw gpf.Error.OnlyOnClassForAttributeClass({
                        attributeName: _gpfGetClassDefinition(this.constructor).name()
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
                    attributes;

                // Get constraints set for THIS attribute
                attributes = new _gpfA.Map(this);
                attributes.filter(_gpfAttrConstraint).each(function (member, attributes) {
                    _gpfIgnore(member);
                    var itemsCount = attributes.getItemsCount(),
                        idx;
                    for (idx = 0; idx < itemsCount; ++idx) {
                        attributes.getItem(idx)._check(targetAttribute, objPrototype);
                    }
                });

                // OK, call _alterPrototype
                targetAttribute[originalAlterPrototype].apply(targetAttribute, [objPrototype]);
            }

        },

        protected: {

            /**
             * Throws an exception if target attribute can't be applied to
             * objPrototype
             *
             * @param {gpf.attributes.Attribute} targetAttribute
             * @param {Object} objPrototype
             */
            _check: function (targetAttribute, objPrototype) {
                _gpfIgnore(targetAttribute, objPrototype);
                throw gpf.Error.Abstract();
            },

            // @closure
            _alterPrototype: function (objPrototype) {
                var statics = _gpfA.AttrConstraintAttribute,
                    originalAlterPrototype = statics.originalAlterPrototype;

                // Inherited method will take care of checking attribute class
                this._super(objPrototype);

                /**
                 * Several constraint attributes might be defined, check if
                 * the _alterPrototype has already been overridden
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

        // @inheritdoc gpf.attributes.AttrConstraintAttribute:_check
        _check: function (targetAttribute, objPrototype) {
            _gpfIgnore(objPrototype);
            if (targetAttribute.member() !== "Class") {
                var
                    attributeClass = targetAttribute.constructor,
                    attributeClassDef = _gpfGetClassDefinition(attributeClass);
                throw gpf.Error.ClassOnlyAttribute({
                    attributeName: attributeClassDef.name()
                });
            }
        }

    }

});

/**
 * Used on attribute classes to mark them as member attribute (i.e. they can't
 * be used on Class)
 *
 * @class gpf.attributes.MemberAttributeAttribute
 * @extends gpf.attributes.AttrConstraintAttribute
 * @alias gpf.$MemberAttribute
 */
_gpfDefAttr("$MemberAttribute", _gpfAttrConstraint, {

    protected: {

        // @inheritdoc gpf.attributes.AttrConstraintAttribute:_check
        _check: function (targetAttribute/*, objPrototype*/) {
            if (targetAttribute.member() === "Class") {
                var
                    attributeClass = targetAttribute.constructor,
                    attributeClassDef = _gpfGetClassDefinition(attributeClass);
                throw gpf.Error.MemberOnlyAttribute({
                    attributeName: attributeClassDef.name()
                });
            }
        }

    }

});
/**
 * Used on attribute classes to mark them as unique through the class hierarchy or per member.
 * If one try to define it more than once, an error is raised.
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

        // @inheritdoc gpf.attributes.AttrConstraintAttribute:_check
        _check: function (targetAttribute, objPrototype) {
            var
                objectClass,
                objectClassDef,
                objectClassAttributes,
                attributeClass,
                attributeClassDef,
                attributesInObj,
                member = targetAttribute.member();

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
                if (1 < attributesInObj.count()) {
                    throw gpf.Error.UniqueAttributeConstraint({
                        attributeName: attributeClassDef.name(),
                        className: objectClassDef.name()
                    });
                }
            } else if (1 < attributesInObj.member(member).getItemsCount()) {
                throw gpf.Error.UniqueMemberAttributeConstraint({
                    attributeName: attributeClassDef.name(),
                    className: objectClassDef.name(),
                    memberName: member
                });
            }
        }

    },

    public: {

        /**
         * Restricts attribute multiplicity
         *
         * @param {Boolean} [classScope=true] classScope True to set limit to
         * one instance per class (including hierarchy) or false to limit to one
         * instance per member.
         * @constructor
         */
        constructor: function (classScope) {
            if (undefined !== classScope) {
                this._classScope = true === classScope;
            }
        }

    }

});
