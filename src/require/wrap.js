/**
 * @file Require context wrapper
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfRequireAllocate*/
/*global _gpfPathParent*/
/*exported _gpfRequireWrapGpf*/ // Wrap gpf to fit the new context and give access to gpf.require.define promise
/*#endif*/

/**
 * @typedef gpf.typedef._requireWrapper
 * @property {Object} gpf Modified version of gpf handle
 * @property {Promise<*>} promise Promise that is resolved immediately or upon the first use of gpf.require.define
 */

function _gpfRequireAllocateWrapper () {
    return {
        gpf: Object.create(gpf),
        promise: Promise.resolve(),
        _initialDefine: null
    };
}

function _gpfRequireWrappedDefine () {
    /*jshint validthis:true*/
    var wrapper = this, //eslint-disable-line
        gpfRequire = wrapper.gpf.require,
        gpfRequireDefine = wrapper._initialDefine;
    wrapper.promise = gpfRequireDefine.apply(gpfRequire, arguments);
    gpfRequire.define = gpfRequireDefine;
    return wrapper.promise;
}

function _gpfRequirePlugWrapper (wrapper, require) {
    wrapper._initialDefine = require.define;
    require.define = _gpfRequireWrappedDefine.bind(wrapper);
    wrapper.gpf.require = require;
    return wrapper;
}

/**
 * Wrap gpf to fit the new context and give access to gpf.require.define promise
 *
 * @param {Object} context Require context
 * @param {String} name Resource (resolved) name
 * @return {gpf.typedef._requireWrapper} Wrapper
 */
function _gpfRequireWrapGpf (context, name) {
    return _gpfRequirePlugWrapper(_gpfRequireAllocateWrapper(), _gpfRequireAllocate(context, {
        base: _gpfPathParent(name)
    }));
}
