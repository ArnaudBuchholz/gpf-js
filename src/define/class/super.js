/**
 * @file Class method superify
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfFunctionBuild*/ // Build function from description and context
/*global _gpfFunctionDescribe*/ // Extract function description
/*exported _gpfClassMethodSuperify*/ // Create a method that can use this.$super
/*#endif*/

function _gpfClassMethodCreateSuperified (method, superMethod) {
    // Keep signature
    var description = _gpfFunctionDescribe(method);
    description.body = "this.$super=s;"
        + "var r=m.apply(this,arguments);"
        + "delete this.$super;\n"
        + "return r;";
    return _gpfFunctionBuild(description, {
        m: method,
        s: superMethod
    });
}

function _gpfClassMethodSuperifyIfNeeded (method, superMethod) {
    if (new RegExp("\\.\\$super\\b").exec(method)) {
        return _gpfClassMethodCreateSuperified(method, superMethod);
    }
    return method;
}

/**
 * Create a method that can use this.$super
 *
 * @param {Function} method method to superify
 * @param {Function} superMethod method to be called when this.$super is called
 * @return {Function} Superified method
 * @since 0.1.6
 */
function _gpfClassMethodSuperify (method, superMethod) {
    if (!superMethod) {
        superMethod = _gpfEmptyFunc;
    }
    return _gpfClassMethodSuperifyIfNeeded(method, superMethod);
}
