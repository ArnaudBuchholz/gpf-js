/*#ifndef(UMD)*/
"use strict";
/*exported _gpfProcessDefineParams*/ // Apply the default transformations on the define params
/*#endif*/

var _GPF_DEFINE_PARAM_NAME = 0,
    _GPF_DEFINE_PARAM_BASE = 1,
    _GPF_DEFINE_PARAM_DEFINITION = 2;

// Check if base looks like a definition (and no definition was passed), if so invert
function _gpfProcessDefineParamNoBase (defaultBase, params) {
    if (undefined === params[_GPF_DEFINE_PARAM_DEFINITION] && "object" === typeof params[_GPF_DEFINE_PARAM_BASE]) {
        params[_GPF_DEFINE_PARAM_DEFINITION] = params[_GPF_DEFINE_PARAM_BASE];
        params[_GPF_DEFINE_PARAM_BASE] = defaultBase;
    }
}

// Check if the name is relative, if so concatenate to the rootNamespace
function _gpfProcessDefineParamName (rootNamespace, params) {
    var name = params[_GPF_DEFINE_PARAM_NAME];
    if (-1 === name.indexOf(".")) {
        params[_GPF_DEFINE_PARAM_NAME] = rootNamespace + name;
    }
}

// Set base to defaultBase if undefined
function _gpfProcessDefineParamDefaultBase (defaultBase, params) {
    if (!params[_GPF_DEFINE_PARAM_BASE]) {
        params[_GPF_DEFINE_PARAM_BASE] = defaultBase;
    }
}

// Set definition to empty if undefined
function _gpfProcessDefineParamDefaultDefinition (params) {
    if (!params[_GPF_DEFINE_PARAM_DEFINITION]) {
        params[_GPF_DEFINE_PARAM_DEFINITION] = {};
    }
}

/**
 * Process define parameters to inject default values when needed
 *
 * @param {String} rootNamespace
 * @param {Function|undefined|String} defaultBase
 * @param {Array} params gpf.define parameters:
 * - {String} name New class contextual name
 * - {String} [base=undefined] base Base class contextual name
 * - {Object} [definition=undefined] definition Class definition
 */
function _gpfProcessDefineParams (rootNamespace, defaultBase, params) {
    _gpfProcessDefineParamNoBase(defaultBase, params);
    _gpfProcessDefineParamName(rootNamespace, params);
    _gpfProcessDefineParamDefaultBase(defaultBase, params);
    _gpfProcessDefineParamDefaultDefinition(params);
}
