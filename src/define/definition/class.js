/*#ifndef(UMD)*/
"use strict";
/*global _GpfExtensibleObject*/ // Extensible
/*global _GpfClassDefMember*/ // GPF class member definition
/*exported _GpfClassDefinition*/ // GPF class definition
/*#endif*/

/**
 * Extensible information about a class
 *
 * @class {_GpfClassDefinition}
 * @param {String} qName Fully qualified class name
 * @param {_GpfClassDefinition} [superClassDef=null] superClassDef Super class definition
 */
function _GpfClassDefinition (qName, superClassDef) {
    /*jshint validthis:true*/ // constructor
    this._qName = qName;
    if (superClassDef) {
        this._super = superClassDef;
    }
}

_GpfClassDefMember.prototype = {

    // @property {String} Fully qualified class name
    _qName: null,

    // @property {_GpfClassDefinition} Super class definition
    _super: null

};

_GpfClassDefinition.extension = new _GpfExtensibleObject(_GpfClassDefinition.prototype);
