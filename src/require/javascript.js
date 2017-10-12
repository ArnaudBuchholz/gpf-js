/**
 * @file Require javascript resource handling
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfIgnore*/
/*global _gpfFunc*/
/*global _gpfRegExpForEach*/
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfRequireProcessor*/
/*global _gpfRequireAllocate*/
/*global _gpfPathParent*/
/*#endif*/

_gpfErrorDeclare("require/javascript", {

    /**
     * ### Summary
     *
     * Dynamic require not supported
     *
     * ### Description
     *
     * When loading a [CommonJS](http://www.commonjs.org/) module, a first pass is done to extract all requires being
     * called. If the require is based on a complex parameter (variable or string manipulation), the loader won't be
     * able to understand the require. No fallback mechanism is implemented yet
     */
    noCommonJSDynamicRequire:
        "Dynamic require not supported"

});

//region CommonJS

var _gpfRequireJsModuleRegEx = /[^\.]\brequire\b\s*\(\s*['|"]([^"']+)['|"]\s*\)/g;

function _gpfRequireCommonJSBuildNamedDependencies (requires) {
    return requires.reduce(function (dictionary, name) {
        dictionary[name] = name;
        return dictionary;
    }, {});
}

function _gpfRequireCommonJs (myGpf, content, requires) {
    return myGpf.require.define(_gpfRequireCommonJSBuildNamedDependencies(requires), function (require) {
        var module = {};
        _gpfFunc(["gpf", "module", "require"], content)(myGpf, module, function (name) {
            return require[name] || gpf.Error.noCommonJSDynamicRequire();
        });
        return module.exports;
    });
}

//endregion

//region GPF, AMD (define) and others

function _gpfRequireAmdDefineParamsFactoryOnly (params) {
    return {
        dependencies: [],
        factory: params[0]
    };
}

function _gpfRequireAmdDefineParamsDependenciesAndFactory (params) {
    return {
        dependencies: params[0],
        factory: params[1]
    };
}

function _gpfRequireAmdDefineParamsAll (params) {
    return {
        dependencies: params[1],
        factory: params[2]
    };
}

var
    /**
     * Mapping of define parameter count to dependencies / factory
     *
     * @type {Function[]}
     */
    _gpfRequireAmdDefineParamsMapping = [
        null,
        _gpfRequireAmdDefineParamsFactoryOnly,
        _gpfRequireAmdDefineParamsDependenciesAndFactory,
        _gpfRequireAmdDefineParamsAll
    ];

function _gpfRequireAmdDefine (name, dependencies, factory) {
    /*jshint validthis:true*/
    _gpfIgnore(name, dependencies, factory);
    var myGpf = this, //eslint-disable-line
        params = _gpfRequireAmdDefineParamsMapping[arguments.length](arguments);
    myGpf.require.define(params.dependencies, function (require) {
        require.length = params.dependencies.length;
        return params.factory.apply(null, [].slice.call(require));
    });
}

function _gpfRequireOtherJs (myGpf, content) {
    _gpfFunc(["gpf", "define"], content)(myGpf, _gpfRequireAmdDefine.bind(myGpf));
}

//endregion

function _gpfRequireWrapGpfFor (context, name) {
    var wrappedGpf = Object.create(gpf),
        newRequire = _gpfRequireAllocate(context, {
            base: _gpfPathParent(name)
        }),
        initialDefine = newRequire.define;
    newRequire._promise = Promise.resolve(); // default
    // Wrap require.define to Grab the first allocated promise (if any)
    newRequire.define = function () {
        newRequire._promise = initialDefine.apply(this, arguments);
        newRequire.define = initialDefine;
        return newRequire._promise;
    };
    wrappedGpf.require = newRequire;
    return wrappedGpf;
}

_gpfRequireProcessor[".js"] = function (name, content) {
    var myGpf = _gpfRequireWrapGpfFor(this, name);
    // CommonJS ?
    var requires = _gpfRegExpForEach(_gpfRequireJsModuleRegEx, content);
    if (requires.length) {
        return _gpfRequireCommonJs(myGpf, content, requires.map(function (match) {
            return match[1];
        }));
    }
    _gpfRequireOtherJs(myGpf, content);
    return myGpf.require._promise;
};
