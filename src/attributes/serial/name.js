/**
 * @file gpf.attributes.serial.Name attribute
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfAttribute*/ // Shortcut for gpf.attributes.Attribute
/*global _gpfAttributeSerialBase*/ // Shortcut for gpf.attributes.serial.Base
/*exported _gpfAttributeSerialName*/ // Shortcut for gpf.attributes.serial.Name
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
    $class: "gpf.attributes.serial.Name",
    $extend: _gpfAttributeSerialBase,

    constructor: function (name) {
        this._sName = name;
    },

    getName: function () {
        return this._sName;
    }

});
