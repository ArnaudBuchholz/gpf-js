/**
 * @file Class constructor
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfFunctionBuild*/ // Build function from description and context
/*global _gpfFunctionDescribe*/ // Extract function description
/*global _gpfIsClass*/ // Check if the parameter is an ES6 class
/*exported _gpfDefineClassConstructorAddCodeWrapper*/ // Adds a constructor code wrapper
/*exported _gpfDefineGetClassSecuredConstructor*/ // Allocate a secured named constructor
/*#endif*/

_gpfErrorDeclare("define/class/constructor", {

    /**
     * ### Summary
     *
     * This is a class constructor function, use with new
     *
     * ### Description
     *
     * Class constructors are not designed to be called without `new`
     *
     * @since 0.1.6
     */
    classConstructorFunction: "This is a class constructor function, use with new"

});

Object.assign(_GpfClassDefinition.prototype, {

    /**
     * Resolved constructor
     *
     * @type {Function}
     * @since 0.1.6
     */
    _resolvedConstructor: _gpfEmptyFunc

});


var _gpfDefineClassConstructorCodeWrappers = [];

/**
 * Adds a constructor code wrapper
 *
 * @param {Function} codeWrapper Function receiving class definition and current code
 * @since 0.2.8
 */
function _gpfDefineClassConstructorAddCodeWrapper (codeWrapper) {
    _gpfDefineClassConstructorCodeWrappers.push(codeWrapper);
}

function _gpfDefineGetClassSecuredConstructorGetES6ConstructionBody (classDefinition) {
    if (classDefinition._extend === classDefinition._resolvedConstructor) {
        return "var that = Reflect.construct(_classDef_._extend, arguments, _classDef_._instanceBuilder);\n";
    }
    return "var that,\n"
        + "    $super = function () {\n"
        + "        that = Reflect.construct(_classDef_._extend, arguments, _classDef_._instanceBuilder);\n"
        + "    },\n"
        + "    hasOwnProperty = function (name) {\n"
        + "        return !!that && Object.prototype.hasOwnProperty.call(that, name);\n"
        + "    },\n"
        + "    proxy = new Proxy({}, {\n"
        + "        get: function (obj, property) {\n"
        + "            if (property === \"hasOwnProperty\") {\n"
        + "              return hasOwnProperty;\n"
        + "            }\n"
        + "            if (!that && property === \"$super\") {\n"
        + "              return $super;\n"
        + "            }\n"
        + "            return that[property];\n"
        + "        },\n"
        + "        set: function (obj, property, value) {\n"
        + "            if (property !== \"$super\") {\n"
        + "                that[property] = value;\n"
        + "            }\n"
        + "            return true;\n"
        + "        }\n"
        + "    });\n"
        + "_classDef_._resolvedConstructor.apply(proxy, arguments);\n";
}

function _gpfDefineGetClassSecuredConstructorGetMainConstructionPattern (classDefinition) {
    if (_gpfIsClass(classDefinition._extend)) {
        return {
            instance: "that",
            body: _gpfDefineGetClassSecuredConstructorGetES6ConstructionBody(classDefinition)
        };
    }
    return {
        instance: "this",
        body: "_classDef_._resolvedConstructor.apply(this, arguments);"
    };
}

function _gpfDefineGetClassSecuredConstructorBody (classDefinition) {
    var construction = _gpfDefineGetClassSecuredConstructorGetMainConstructionPattern(classDefinition),
        constructorBody = "if (!(this instanceof _classDef_._instanceBuilder)) gpf.Error.classConstructorFunction();\n"
            + _gpfDefineClassConstructorCodeWrappers.reduce(function (body, codeWrapper) {
                return codeWrapper(classDefinition, body, construction.instance);
            }, construction.body);
    if (construction.instance !== "this") {
        constructorBody += "\nreturn " + construction.instance + ";";
    }
    return constructorBody;
}

function _gpfDefineGetClassSecuredConstructorDefinition (classDefinition) {
    return {
        name: classDefinition._name,
        parameters: _gpfFunctionDescribe(classDefinition._resolvedConstructor).parameters,
        body: _gpfDefineGetClassSecuredConstructorBody(classDefinition)
    };
}

function _gpfDefineGetClassSecuredConstructorContext (classDefinition) {
    return {
        gpf: gpf,
        _classDef_: classDefinition
    };
}

/**
 * Allocate a secured named constructor
 *
 * @param {_GpfClassDefinition} classDefinition Class definition
 * @return {Function} Secured named constructor
 * @gpf:closure
 * @since 0.1.6
 */
function _gpfDefineGetClassSecuredConstructor (classDefinition) {
    return _gpfFunctionBuild(_gpfDefineGetClassSecuredConstructorDefinition(classDefinition),
        _gpfDefineGetClassSecuredConstructorContext(classDefinition));
}
