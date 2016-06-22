/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // GPF class definition
/*global _gpfContext*/ // Resolve contextual string
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfProcessDefineParams*/ // Apply the default transformations on the define params
/*global _gpfProcessInternalDefineParams*/ // Apply the default transformations on the internal define params
/*exported _gpfDefine*/ // Shortcut for gpf.define
/*#endif*/

// If the name also contains a namespace, set the contexts to the value
function _gpfSetContextualName (name, value) {
    var path,
        leafName;
    path = name.split(".");
    if (1 < path.length) {
        leafName = path.pop();
        _gpfContext(path, true)[leafName] = value;
    }
}

/**
 * Defines a new class by setting a contextual name
 *
 * @param {String} name New class contextual name
 * @param {Function} Base Base class
 * @param {Object} definition Class definition
 * @return {Function} New class constructor
 */
function _gpfDefineCore (name, Base, definition) {
    var result,
        classDef;
    classDef = new _GpfClassDefinition(name, Base, definition);
    result = classDef._Constructor;
    _gpfSetContextualName(name, result);
    return result;
}

// Apply the processing function and call _gpfDefineCore
function _gpfDefineProcessParamsAndCallCore (params, processFunction) {
    processFunction("", Object, params);
    return _gpfDefineCore.apply(null, params);
}

/**
 * @inheritdoc gpf#define
 * Internal version
 */
function _gpfDefine (name, base, definition) {
    _gpfIgnore(name, base, definition);
    return _gpfDefineProcessParamsAndCallCore([].slice.call(arguments), _gpfProcessInternalDefineParams);
}

/**
 * Defines a new class by setting a contextual name
 *
 * @param {String} name New class contextual name
 * @param {String} [base=undefined] base Base class contextual name
 * @param {Object} [definition=undefined] definition Class definition
 *
 * @also
 *
 * @param {String} name New class contextual name
 * @param {Object} definition Class definition
 *
 * @return {Function}
 */
gpf.define = function (name, base, definition) {
    _gpfIgnore(name, base, definition);
    return _gpfDefineProcessParamsAndCallCore([].slice.call(arguments), _gpfProcessDefineParams);
};
