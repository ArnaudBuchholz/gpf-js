/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // GPF class definition
/*global _gpfAssert*/ // Assertion method
/*global _gpfAsserts*/ // Multiple assertion method
/*global _gpfContext*/ // Resolve contextual string
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _gpfDefine*/ // Shortcut for gpf.define
/*#endif*/

// If the name also contains a namespace, set the contexts to the value
function _gpfSetContextualName (name, value) {
    var path,
        leafName;
    if (-1 < name.indexOf(".")) {
        path = name.split(".");
        leafName = path.pop();
        _gpfContext(path, true)[leafName] = value;
    }
}

/**
 * Defines a new class by setting a contextual name
 *
 * @param {String} name New class contextual name
 * @param {String} base Base class contextual name
 * @param {Object} definition Class definition
 * @return {Function}
 */
function _gpfDefineCore (name, base, definition) {
    _gpfAsserts({
        "name is required (String)": "string" === typeof name,
        "base is required (String|Function)": "string" === typeof base || base instanceof Function,
        "definition is required (Object)": "object" === typeof definition
    });
    var result,
        classDef;
    if ("string" === typeof base) {
        // Convert base into the function
        base = _gpfContext(base.split("."));
        _gpfAssert(base instanceof Function, "base must resolve to a function");
    }
    classDef = new _GpfClassDefinition(name, base, definition);
    result = classDef._Constructor;
    _gpfSetContextualName(name, result);
    return result;
}

// Replace the shortcut with the correct property name
function _gpfCleanDefinition (name, shortcut) {
    /*jshint validthis:true*/ // Bound to the definition below
    var shortcutValue = this[shortcut];
    if (undefined !== shortcutValue) {
        this[name] = shortcutValue;
        delete this[shortcut];
    }
}

var _gpfCleaningShortcuts = {
    "-": "private",
    "#": "protected",
    "+": "public",
    "~": "static"
};

/**
 * @inheritdoc _gpfDefineCore
 * Provides shortcuts for visibility:
 * - "-" for private
 * - "#" for protected
 * - "+" for public
 * - "~" for static
 */
function _gpfDefine (name, base, definition) {
    _gpfObjectForEach(_gpfCleaningShortcuts, _gpfCleanDefinition, definition);
    return _gpfDefineCore(name, base, definition);
}

/**
 * Defines a new class by setting a contextual name
 *
 * @param {String} name New class contextual name
 * @param {String} [base=undefined] base Base class contextual name
 * @param {Object} [definition=undefined] definition Class definition
 * @return {Function}
 */
gpf.define = function (name, base, definition) {
    if ("object" === typeof base) {
        definition = base;
        base = undefined;
    }
    if (undefined === base) {
        base = Object; // Root class
    }
    return _gpfDefineCore(name, base, definition || {});
};
