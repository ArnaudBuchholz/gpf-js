/*#ifndef(UMD)*/
"use strict";
/*#endif*/

/**
 * Reads definition content to augment the class definition
 *
 * @param {_GpfClassDefinition} classDef Class definition
 * @param {Object} definition Definition content
 * @class
 */
function _GpfClassDefinitionReader (classDef, definition) {
    this._classDef = classDef;
    this._definition = definition;
}

_GpfClassDefinitionReader.prototype = {

    /**
     * Class definition
     *
     * @type {_GpfClassDefinition}
     */
    _classDef: null,

    /**
     * Content definition
     *
     * @type {Object}
     */
    _definition: null,

    /**
     * Converts definition content to class information
     */
    convert: function () {
        this._preProcess();
        this._process();
        this._postProcess();
    }

};
