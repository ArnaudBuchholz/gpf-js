/**
 * @file Class method superify
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfFunctionBuild*/ // Build function from description and context
/*global _gpfFunctionDescribe*/ // Extract function description
/*exported _gpfClassMethodSuperify*/ // Create a method that can use this.$super
/*#endif*/

function _gpfGet$Super (that, methodName, superMembers) {
    var superProto = Object.getPrototypeOf(Object.getPrototypeOf(that));
    function $super () {
        return superProto[methodName].apply(this, arguments); //eslint-disable-line no-invalid-this
    }
    superMembers.forEach(function (memberName) {
        $super[memberName] = superProto[memberName].bind(that);
    });
    return $super;
}


function _gpfClassMethodCreateSuperified (method, methodName, superMembers) {
    // Keep signature
    var description = _gpfFunctionDescribe(method);
    description.body = "this.$super=_gpfGet$Super_(this, _methodName_, _superMembers_);"
        + "var _result_=_method_.apply(this,arguments);"
        + "delete this.$super;\n"
        + "return _result_;";
    return _gpfFunctionBuild(description, {
        _method_: method,
        _methodName_: methodName,
        _superMembers_: superMembers,
        _gpfGet$Super_: _gpfGet$Super
    });
}

function _gpfClassMethodExtractSuperMembers (method) {
    var re = new RegExp("\\.\\$super\\.(\\w+)\\(", "g"),
        match = re.exec(method),
        result = [];
    while (match) {
        result.push(match[1]);
        match = re.exec(method);
    }
    return result;
}

/**
 * Create a method that can use this.$super
 *
 * @param {Function} method Method to superify
 * @param {String} methodName Name of the method (used to search in object prototype)
 * @return {Function} Superified method
 * @since 0.1.6
 */
function _gpfClassMethodSuperify (method, methodName) {
    if (new RegExp("\\.\\$super\\b").exec(method)) {
        return _gpfClassMethodCreateSuperified(method, methodName, _gpfClassMethodExtractSuperMembers(method));
    }
    return method;
}
