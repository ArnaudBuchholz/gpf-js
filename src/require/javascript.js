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

function _gpfRequireCommonJs (myRequire, content, requires) {
    var dependencies = requires.reduce(function (dictionary, name) {
            dictionary[name] = name;
            return dictionary;
        }, {}),
        factory = _gpfFunc(["gpf", "module", "require"], content);
    return myRequire(dependencies, function (require) {
        var module = {};
        function commonJSRequire (name) {
            return require[name] || gpf.Error.noCommonJSDynamicRequire();
        }
        factory(gpf, module, commonJSRequire);
        return module.exports;
    });
}

//enregion

//region GPF, AMD (define) and others


function _gpfRequireAmdDefine (name, dependencies, factory) {
    /*jshint validthis:true*/
    var context = this; //eslint-disable-line
    if (Array.isArray(name)) {
        factory = dependencies;
        dependencies = name;
    }
    _gpfIgnore(name);
    context.promise = context.require(dependencies, function (require) {
        require.length = dependencies.length;
        return factory.apply(null, [].slice.call(require));
    });
}

// function _gpfRequireInJSResource () {
//
// }

function _gpfRequireOtherJs(myRequire, content) {
    var context = {
        promise: null,
        require: myRequire
    };
    var factory = _gpfFunc(["gpf", "define"], content);
    factory(gpf, _gpfRequireAmdDefine.bind(context));
    return context.promise;
}

//endregion

_gpfRequireProcessor[".js"] = function (name, content) {
    var me = this,
        myRequire = _gpfRequireAllocate(me);
    myRequire.configure({
        base: _gpfPathParent(name)
    });
    // CommonJS ?
    var requires = [],
        count = _gpfRegExpForEach(_gpfRequireJsModuleRegEx, content, function (match) {
            requires.push(match[1]);
        });
    if (count) {
        return _gpfRequireCommonJs(myRequire, content, requires);
    }
    return _gpfRequireOtherJs(myRequire, content);
};
