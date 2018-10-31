/**
 * @file gpf.attributes.Attribute base class
 * @since 0.2.4
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*exported _gpfAttribute*/ // Shortcut for gpf.attributes.Attribute
/*#endif*/

/**
 * @namespace gpf.attributes
 * @description Root namespace for GPF attributes
 * @since 0.2.4
 */
gpf.attributes = {};

/**
 * Base class for all attributes
 *
 * @class gpf.attributes.Attribute
 * @since 0.2.4
 */
var _gpfAttribute = _gpfDefine({
    $class: "gpf.attributes.Attribute",
    $abstract: true,

    /**
     * Class member name the attribute was set on (or undefined if at class level)
     * @type {String|undefined}
     * @since 0.2.8
     */
    _memberName: undefined,

    /**
     * @gpf:read _memberName
     * @since 0.2.8
     */
    getMemberName: function () {
        return this._memberName;
    },

    /**
     * Class constructore the attribute was set on
     * @type {Function|undefined}
     * @since 0.2.8
     */
    _ClassConstructor: undefined,

    /**
     * @gpf:read _ClassConstructor
     * @since 0.2.8
     */
    getClassConstructor: function () {
        return this._ClassConstructor;
    },

    /**
     * Check the attribute usage
     * **NOTE**: Experimental feature, do not rely on this method
     *
     * @param {String} member Member name or empty if global to the class
     * @param {_GpfClassDefinition} classDefinition Class definition
     * @private
     * @since 0.2.8
     */
    _check: function (member, classDefinition) {
        _gpfIgnore(member, classDefinition);
    },

    /**
     * Build the class according to the attribute usage
     * **NOTE**: Experimental feature, do not rely on this method
     *
     * @param {String} member Member name or empty if global to the class
     * @param {_GpfClassDefinition} classDefinition Class definition
     * @param {Object} classPrototype Class prototype being built
     * @private
     * @since 0.2.8
     */
    _build: function (member, classDefinition, classPrototype) {
        _gpfIgnore(member, classDefinition, classPrototype);
    }

});
