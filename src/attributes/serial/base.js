/**
 * @file gpf.attributes.serial attributes base class
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfAttribute*/ // Shortcut for gpf.attributes.Attribute
/*exported _gpfAttributeSerialBase*/ // Shortcut for gpf.attributes.serial.Base
/*#endif*/

/**
 * @namespace gpf.attributes.serial
 * @description Root namespace for serialization attributes
 */
gpf.attributes.serial = {};

/**
 * Base class for all serialization attributes
 *
 * @class gpf.attributes.serial.Base
 */
var _gpfAttributeSerialBase = _gpfDefine({
    $class: "gpf.attributes.serial.Base",
    $extend: _gpfAttribute,
    $abstract: true

});
