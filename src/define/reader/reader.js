/*#ifndef(UMD)*/
"use strict";
/*global _gpfAsserts*/ // Multiple assertion method
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*global _GpfClassDefinition*/ // GPF class definition
/*#endif*/

/**
 * Reads definition content to augment the class definition
 *
 * @param {_GpfClassDefinition} classDef Class definition
 * @param {Object} definition Definition content
 * @class
 */
function _GpfClassDefinitionReader (classDef, definition) {
    _gpfAsserts({
        "Expected a _GpfClassDefinition": classDef instanceof _GpfClassDefinition,
        "Expected a definition object": definition && typeof definition === "object"
    });
    /*jshint validthis:true*/ // constructor
    this._classDef = classDef;
    this._definition = definition;
    this._members = [];
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
    },

    _process: function () {
        if (!this._definition) {
            return;
        }
        _gpfObjectForEach(this._definition, this._processMember, this);
    },

    _members: [],

    _memberProcessors: [],

    _processMember: function (defaultValue, memberName) {
        this._memberProcessors.forEach(function (memberProcessor) {
            var match = memberProcessor.matcher.exec(memberName);
            if (match) {
                this._members.push(memberProcessor.process(match, defaultValue));
            }
        }, this);
    }

};
