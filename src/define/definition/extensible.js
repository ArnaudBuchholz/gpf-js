/*#ifndef(UMD)*/
"use strict";
/*global _gpfStringCapitalize*/ // Capitalize the string
/*exported _GpfExtensionHandler*/ // Extension handler
/*#endif*/

/**
 * Add members (extensions) to an object
 *
 * @class _GpfExtensionHandler
 * @param {Object} extensibleObject
 */
function _GpfExtensionHandler (extensibleObject) {
    /*jshint validthis:true*/ // constructor
    this._extensibleObject = extensibleObject;
}

_GpfExtensionHandler.prototype = {

    // @property {Object} Object that receives extensions
    _extensibleObject: null,


    add: function (name, defaultValue) {
        this._extensibleObject["_" + name] = defaultValue;
        this._extensibleObject["get" + _gpfStringCapitalize(name)] = function () {};
    }

};
