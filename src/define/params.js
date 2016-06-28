/*#ifndef(UMD)*/
"use strict";
/*global _gpfAsserts*/ // Multiple assertion method
/*global _gpfContext*/ // Resolve contextual string
/*global _gpfProcessInternalDefinition*/ // Process internal definition
/*exported _gpfProcessDefineParams*/ // Apply the default transformations on the define params
/*exported _gpfProcessInternalDefineParams*/ // Apply the default transformations on the internal define params
/*#endif*/

var _GPF_DEFINE_PARAM_NAME = 0,
    _GPF_DEFINE_PARAM_SUPER = 1,
    _GPF_DEFINE_PARAM_DEFINITION = 2;

// Check if base looks like a definition (and no definition was passed), if so invert
function _gpfProcessDefineParamNoSuperUsed (defaultSuper, params) {
    if (undefined === params[_GPF_DEFINE_PARAM_DEFINITION] && "object" === typeof params[_GPF_DEFINE_PARAM_SUPER]) {
        params[_GPF_DEFINE_PARAM_DEFINITION] = params[_GPF_DEFINE_PARAM_SUPER];
        params[_GPF_DEFINE_PARAM_SUPER] = defaultSuper;
    }
}

// Check if the name is relative, if so concatenate to the rootNamespace
function _gpfProcessDefineParamCheckIfRelativeName (rootNamespace, params) {
    var name = params[_GPF_DEFINE_PARAM_NAME];
    if (-1 === name.indexOf(".")) {
        params[_GPF_DEFINE_PARAM_NAME] = rootNamespace + name;
    }
}

// Set base to defaultBase if undefined
function _gpfProcessDefineParamDefaultSuper (DefaultSuper, params) {
    if (!params[_GPF_DEFINE_PARAM_SUPER]) {
        params[_GPF_DEFINE_PARAM_SUPER] = DefaultSuper;
    }
}

// Set definition to empty if undefined
function _gpfProcessDefineParamDefaultDefinition (params) {
    if (!params[_GPF_DEFINE_PARAM_DEFINITION]) {
        params[_GPF_DEFINE_PARAM_DEFINITION] = {};
    }
}

// Convert base parameter from string to contextual object
function _gpfProcessDefineParamResolveBase (params) {
    var Super = params[_GPF_DEFINE_PARAM_SUPER];
    if (!(Super instanceof Function)) {
        params[_GPF_DEFINE_PARAM_SUPER] = _gpfContext(Super.toString().split("."));
    }
}

// Check that the parameters are correct
function _gpfProcessDefineParamsCheck (params) {
    _gpfAsserts({
        "name is required (String)": "string" === typeof params[_GPF_DEFINE_PARAM_NAME],
        "Super is required and must resolve to a Constructor": params[_GPF_DEFINE_PARAM_SUPER] instanceof Function,
        "definition is required (Object)": "object" === typeof params[_GPF_DEFINE_PARAM_DEFINITION]
    });
}

/**
 * Process define parameters to inject default values when needed
 *
 * @param {String} rootNamespace
 * @param {Function|undefined|String} defaultSuper
 * @param {Array} params gpf.define parameters:
 * - {String} name New class contextual name
 * - {String} [base=undefined] base Base class contextual name
 * - {Object} [definition=undefined] definition Class definition
 */
function _gpfProcessDefineParams (rootNamespace, defaultSuper, params) {
    _gpfProcessDefineParamNoSuperUsed(defaultSuper, params);
    _gpfProcessDefineParamCheckIfRelativeName(rootNamespace, params);
    _gpfProcessDefineParamDefaultSuper(defaultSuper, params);
    _gpfProcessDefineParamDefaultDefinition(params);
    _gpfProcessDefineParamResolveBase(params);
    _gpfProcessDefineParamsCheck(params);
}

/**
 * @inheritdoc _gpfProcessDefineParams
 * Adds behavior specific to the internal version
 */
function _gpfProcessInternalDefineParams (rootNamespace, defaultSuper, params) {
    _gpfProcessDefineParams(rootNamespace, defaultSuper, params);
    _gpfProcessInternalDefinition(params[_GPF_DEFINE_PARAM_DEFINITION]);
}
