/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // GPF class definition
/*global _gpfAsserts*/ // Multiple assertion method
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _GpfClassDefinitionReader*/ // Class definition reader
/*#endif*/

/**
 * @typedef _GpfClassDefinitionMemberProcessor
 * @property {RegExp} matcher Regular expression matching member name
 * @property {Function} process If matching the member name, this function is called with the following parameters:
 * - {Object} match the matcher regular expression result
 * - {*} defaultValue the member value in the definition dictionary
 * - {_GpfClassDefinitionReader} reader the reader
 */

/**
 * Reads definition dictionary to augment the class definition
 *
 * @param {_GpfClassDefinition} classDef Class definition
 * @param {Object} definition Definition dictionary
 * @constructor
 */
function _GpfClassDefinitionReader (classDef, definition) {
    _gpfAsserts({
        "Expected a _GpfClassDefinition": classDef instanceof _GpfClassDefinition,
        "Expected a definition dictionary": definition && typeof definition === "object"
    });
    /*jshint validthis:true*/ // constructor
    /*eslint-disable no-invalid-this */
    this._classDef = classDef;
    this._definition = definition;
    this._processedMembers = [];
    this._memberProcessors = [].concat(_GpfClassDefinitionReader.defaultMemberProcessors);
    /*eslint-enable no-invalid-this */
}

/**
 * Default list of members processors
 *
 * @type {_GpfClassDefinitionMemberProcessor[]}
 */
_GpfClassDefinitionReader.defaultMemberProcessors = [];

_GpfClassDefinitionReader.prototype = {

    /**
     * Class definition
     *
     * @type {_GpfClassDefinition}
     */
    _classDef: null,

    /** @gpf:read _classDef */
    getClassDefinition: function () {
        return this._classDef;
    },

    /**
     * Definition dictionary
     *
     * @type {Object}
     */
    _definition: null,

    /** @gpf:read _definition */
    getDefinitionDictionary: function () {
        return this._definition;
    },

    /**
     * Converts definition content to class information
     */
    convert: function () {
        this._preProcessDefinition();
        this._processMembers();
        this._postProcess();
    },

    /**
     * Pre-process the definition dictionary,
     *
     * If the processing needs to stop, set this._definition to null
     */
    _preProcessDefinition: function () {},

    /**
     * Post-process the definition dictionary.
     *
     * @private
     */
    _postProcess: function () {},

    /**
     * Process members of the definition dictionary
     */
    _processMembers: function () {
        if (!this._definition) {
            return;
        }
        _gpfObjectForEach(this._definition, this._processMember, this);
    },

    /**
     * List of processed members
     *
     * @type {_GpfClassDefMember[]}
     */
    _processedMembers: [],

    /**
     * List of members processors
     *
     * @type {_GpfClassDefinitionMemberProcessor[]}
     */
    _memberProcessors: [],

    _processMember: function (defaultValue, memberName) {
        this._memberProcessors.forEach(function (memberProcessor) {
            var match = memberProcessor.matcher.exec(memberName);
            if (match) {
                this._processedMembers.push(memberProcessor.process(match, defaultValue, this));
            }
        }, this);
    }

};
