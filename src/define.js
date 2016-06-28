/*#ifndef(UMD)*/
"use strict";
/*global _gpfContext*/ // Resolve contextual string
/*global _gpfDefineFactory*/ // gpf.define factory
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfProcessDefineParams*/ // Apply the default transformations on the define params
/*global _gpfProcessInternalDefineParams*/ // Apply the default transformations on the internal define params
/*exported _gpfDefine*/ // Shortcut for gpf.define
/*#endif*/

// If the name also contains a namespace, set the contexts to the value
function _gpfDefineUpdateContext (name, value) {
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
 * @param {Function} Super Super class
 * @param {Object} definition Class definition
 * @return {Function} New class constructor
 */
function _gpfDefineCore (name, Super, definition) {
    var NewClass = _gpfDefineFactory(name, Super, definition);
    _gpfDefineUpdateContext(name, NewClass);
    return NewClass;
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
function _gpfDefine (name, Super, definition) {
    _gpfIgnore(name, Super, definition);
    return _gpfDefineProcessParamsAndCallCore([].slice.call(arguments), _gpfProcessInternalDefineParams);
}

/**
 * Defines a new class by setting a contextual name
 *
 * @param {String} name New class contextual name
 * @param {String|Function} [Super=undefined] Super Super class contextual name or constructor
 * @param {Object} [definition=undefined] definition Class definition
 *
 * @also
 *
 * @param {String} name New class contextual name
 * @param {Object} definition Class definition
 *
 * @return {Function}
 */
gpf.define = function (name, Super, definition) {
    _gpfIgnore(name, Super, definition);
    return _gpfDefineProcessParamsAndCallCore([].slice.call(arguments), _gpfProcessDefineParams);
};
