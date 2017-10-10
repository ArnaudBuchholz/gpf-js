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

function _gpfRequireCommonJs (myGpf, content, requires) {
    var dependencies = requires.reduce(function (dictionary, name) {
            dictionary[name] = name;
            return dictionary;
        }, {}),
        factory = _gpfFunc(["gpf", "module", "require"], content);
    return myGpf.require(dependencies, function (require) {
        var module = {};
        function commonJSRequire (name) {
            return require[name] || gpf.Error.noCommonJSDynamicRequire();
        }
        factory(myGpf, module, commonJSRequire);
        return module.exports;
    });
}

//endregion

//region GPF, AMD (define) and others

function _gpfRequireAmdDefine (name, dependencies, factory) {
    /*jshint validthis:true*/
    var myGpf = this; //eslint-disable-line
    if (Array.isArray(name)) {
        factory = dependencies;
        dependencies = name;
    } else if ("function" === typeof name) {
        factory = name;
        dependencies = [];
    }
    _gpfIgnore(name);
    return myGpf.require(dependencies, function (require) {
        require.length = dependencies.length;
        return factory.apply(null, [].slice.call(require));
    });
}

function _gpfRequireOtherJs (myGpf, content) {
    var factory = _gpfFunc(["gpf", "define"], content);
    return factory(myGpf, _gpfRequireAmdDefine.bind(myGpf));
    // return firstPromise;
}

//endregion

_gpfRequireProcessor[".js"] = function (name, content) {
    var me = this, // current require context
        myGpf = Object.create(gpf);
    myGpf.require = _gpfRequireAllocate(me, {
        base: _gpfPathParent(name)
    });
    // CommonJS ?
    var requires = _gpfRegExpForEach(_gpfRequireJsModuleRegEx, content);
    if (requires.length) {
        return _gpfRequireCommonJs(myGpf, content, requires.map(function (match) {
            return match[1];
        }));
    }
    return _gpfRequireOtherJs(myGpf, content);
};
