/**
 * @file Attribtue base class
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*exported _gpfAttribute*/ // Shortcut for gpf.attributes.Attribute
/*#endif*/

/**
 * @namespace gpf.attributes
 * @description Root namespace for GPF attributes
 */
gpf.attributes = {};

/**
 * Base class for all attributes
 *
 * @class gpf.attributes.Attribute
 * @implements {gpf.interfaces.IReadableStream}
 */
var _gpfAttribute = _gpfDefine({
    $class: "gpf.attributes.Attribute"

});
