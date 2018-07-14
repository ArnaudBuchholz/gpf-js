/**
 * @file gpf.attributes.Attribute base class
 * @since 0.2.4
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
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
    $abstract: true

});
