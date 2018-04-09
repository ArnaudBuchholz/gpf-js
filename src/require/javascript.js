/**
 * @file Require javascript resource handling
 * @since 0.2.2
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfHost*/ // Host type
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfRegExpForEach*/ // Executes the callback for each match of the regular expression
/*global _gpfRequireProcessor*/ // Mapping of resource extension to processor function
/*global _gpfRequireWrapGpf*/ // Wrap gpf to fit the new context and give access to gpf.require.define promise
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
     * @since 0.2.2
     */
    noCommonJSDynamicRequire:
        "Dynamic require not supported"

});

var _gpfRequireJsModuleRegEx = /[^.]\brequire\b\s*\(\s*(?:['|"]([^"']+)['|"]|[^)]+)\s*\)/g;

function _gpfRequireJSGetStaticDependencies (resourceName, content) {
    /*jshint validthis:true*/
    var requires = _gpfRegExpForEach(_gpfRequireJsModuleRegEx, content);
    if (requires.length) {
        return _gpfRequireWrapGpf(this, resourceName).gpf.require.define(requires  //eslint-disable-line no-invalid-this
            .map(function (match) {
                return match[1]; // may be undefined if dynamic
            })
            .filter(function (require) {
                return require;
            })
            .reduce(function (dictionary, name) {
                dictionary[name] = name;
                return dictionary;
            }, {}),
        function (require) {
            return require;
        });
    }
    return Promise.resolve({}); // No static dependencies
}

//region AMD define wrapper

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
     * @since 0.2.2
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

function _gpfRequireJS (myGpf, content, staticDependencies) {
    var module = {};
    _gpfFunc(["gpf", "define", "module", "require"], content)(
        myGpf,
        _gpfRequireAmdDefine.bind(myGpf),
        module,
        function (name) {
            return staticDependencies[name] || gpf.Error.noCommonJSDynamicRequire();
        }
    );
    return module.exports;
}

function _gpfRequireJSMapSource (resourceName, content) {
    /*global location*/
    if (_gpfHost === _GPF_HOST.BROWSER) {
        var baseUrl;
        if ("/" === resourceName.charAt(0)) {
            baseUrl = location.origin;
        } else {
            baseUrl = location.toString();
        }
        return "//# sourceURL=" + baseUrl + resourceName + "?eval\n" + content;
    }
    return content;
}

_gpfRequireProcessor[".js"] = function (resourceName, content) {
    var wrapper = _gpfRequireWrapGpf(this, resourceName);
    return _gpfRequireJSGetStaticDependencies.call(this, resourceName, content)
        .then(function (staticDependencies) {
            var exports = _gpfRequireJS(wrapper.gpf, _gpfRequireJSMapSource(resourceName, content), staticDependencies);
            if (undefined === exports) {
                return wrapper.promise;
            }
            return exports;
        });
};
