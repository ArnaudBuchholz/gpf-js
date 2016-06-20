/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*exported _gpfGenerateCustomDefineHandler*/ // Class handler for class types (interfaces...)
/*#endif*/

var _GPF_CUSTOMDEFINEHANDLER_PARAM_NAME = 0,
    _GPF_CUSTOMDEFINEHANDLER_PARAM_BASE = 1,
    _GPF_CUSTOMDEFINEHANDLER_PARAM_DEFINITION = 2;

// Check if definition passed inside base, if so invert
function _gpfProcessCustomDefineHandlerParamNoBase (defaultBase, args) {
    if (undefined === args[_GPF_CUSTOMDEFINEHANDLER_PARAM_DEFINITION]
        && "object" === typeof args[_GPF_CUSTOMDEFINEHANDLER_PARAM_BASE]) {
        args[_GPF_CUSTOMDEFINEHANDLER_PARAM_DEFINITION] = args[_GPF_CUSTOMDEFINEHANDLER_PARAM_BASE];
        args[_GPF_CUSTOMDEFINEHANDLER_PARAM_BASE] = defaultBase;
    }
}

// Check if the name is relative, if so concatenate to the root
function _gpfProcessCustomDefineHandlerParamName (ctxRoot, args) {
    var name = args[_GPF_CUSTOMDEFINEHANDLER_PARAM_NAME];
    if (-1 === name.indexOf(".")) {
        args[_GPF_CUSTOMDEFINEHANDLER_PARAM_NAME] = ctxRoot + name;
    }
}

// Set base to default if undefined
function _gpfProcessCustomDefineHandlerParamDefaultBase (defaultBase, args) {
    if (!args[_GPF_CUSTOMDEFINEHANDLER_PARAM_BASE]) {
        args[_GPF_CUSTOMDEFINEHANDLER_PARAM_BASE] = defaultBase;
    }
}

// Set definition to empty if undefined
function _gpfProcessCustomDefineHandlerParamDefaultDefinition (args) {
    if (!args[_GPF_CUSTOMDEFINEHANDLER_PARAM_DEFINITION]) {
        args[_GPF_CUSTOMDEFINEHANDLER_PARAM_DEFINITION] = {};
    }
}

/**
 * Allocate a new class handler that is specific to a class type (used for interfaces & attributes)
 *
 * @param {String} ctxRoot Default namespace (for intance: gpf.interfaces)
 * @param {String} defaultBase Default contextual root class (for instance: Interface)
 * @return {Function} With the same signature than {@link gpf.define} but namespace and base are defaulted
 * @closure
 */
function _gpfGenerateCustomDefineHandler (ctxRoot, defaultBase) {
    ctxRoot += ".";
    defaultBase = ctxRoot + defaultBase;

    return function (name, base, definition) {
        _gpfIgnore(name, base, definition);
        var args = [].slice.call(arguments);
        _gpfProcessCustomDefineHandlerParamNoBase(defaultBase, args);
        _gpfProcessCustomDefineHandlerParamName(ctxRoot, args);
        _gpfProcessCustomDefineHandlerParamDefaultBase(defaultBase, args);
        _gpfProcessCustomDefineHandlerParamDefaultDefinition(args);
        return _gpfDefine.apply(null, args);
    };
}
