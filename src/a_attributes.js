/*#ifndef(UMD)*/
"use strict";
/*global _gpfA*/ // gpf.attributes
/*global _gpfDefAttr*/ // gpf.define for attributes
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfGetClassDefinition*/ // Get GPF class definition for a constructor
// /*#endif*/

_gpfErrorDeclare("a_attributes", {
  OnlyForAttributeClass:
    "The attribute {attributeName} can be used only on an Attribute class",
  UniqueAttributeConstraint:
    "Attribute {attributeName} already defined on {className}",
  UniqueMemberAttributeConstraint:
    "Attribute {attributeName} already defined on {className}::{memberName}"
});

/**
 * Restricts the usage of an attribute to an attribute class only.
 *
 * @class gpf.attributes.AttributeClassOnlyAttribute
 * @extends gpf.attributes.Attribute
 */
_gpfDefAttr("AttributeClassOnlyAttribute", {

  protected: {

    /**
     * @inheritdoc gpf.attributes.Attribute:_alterPrototype
     */
    _alterPrototype: function (objPrototype) {
      if (!(objPrototype instanceof _gpfA.Attribute)) {
        throw gpf.Error.OnlyForAttributeClass({
          attributeName: _gpfGetClassDefinition(this.constructor)
            .name()
        });
      }
    }

  }

});

/**
 * Used on attribute classes to mark them as unique through the class hierarchy
 * or per member.
 * If one try to define it more than once, an error is raised.
 *
 * @class gpf.attributes.UniqueAttributeAttribute
 * @extends gpf.attributes.Attribute
 * @alias gpf.$UniqueAttribute
 */
_gpfDefAttr("$UniqueAttribute", _gpfA.AttributeClassOnlyAttribute, {

  private: {

    /**
     * The attribute is unique for the whole class when true or per member
     * when false.
     *
     * @type {Boolean}
     * @private
     */
    _classScope: true

  },

  protected: {

    /**
     * @inheritdoc gpf.attributes.Attribute:_alterPrototype
     * @closure
     */
    _alterPrototype: function (objPrototype) {
      // Inherited method will take care of checking attribute class
      this._super(objPrototype);

      /**
       * Because this is an attribute, hook the _alterPrototype and
       * replace it with a method that will check the unicity of it
       */
      var me = this,
        _alterPrototype = objPrototype._alterPrototype;

      /**
       * @inheritdoc gpf.attributes.Attribute:_alterPrototype
       *
       * This version will check that this attribute class is used only
       * once in the provided prototype.
       */
      objPrototype._alterPrototype = function (objPrototype) {
        var
          objectClass,
          objectClassDef,
          objectClassAttributes,
          attributeClass,
          attributeClassDef,
          attributesInObj;

        // Get object class definition & attributes
        objectClass = objPrototype.constructor;
        objectClassDef = _gpfGetClassDefinition(objectClass);
        objectClassAttributes = new _gpfA.Map(objectClass);

        // Get attribute class definition & attributes
        attributeClass = this.constructor;
        attributeClassDef = _gpfGetClassDefinition(attributeClass);

        attributesInObj = objectClassAttributes.filter(attributeClass);

        // Don't forget THIS attribute is already added to the object
        if (me._classScope) {
          if (1 < attributesInObj.count()) {
            throw gpf.Error.UniqueAttributeConstraint({
              attributeName: attributeClassDef.name(),
              className: objectClassDef.name()
            });
          }
        } else if (1 < attributesInObj.member(this._member).length()) {
          throw gpf.Error.UniqueMemberAttributeConstraint({
            attributeName: attributeClassDef.name(),
            className: objectClassDef.name(),
            memberName: name
          });
        }

        // Call initial _alterPrototype
        _alterPrototype.apply(this, arguments);
      };
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
