/*#ifndef(UMD)*/
"use strict";
/*global _gpfContext*/ // Resolve contextual string
/*exported _gpfGetBootstrapMethod*/ // Create a method that contains a bootstrap (called only once)
/*#endif*/

/**
 * Create a method that contains a bootstrap (called only once)
 *
 * @param {String} path method path
 * @param {Function} methodFactory Must return a function (it receives the path as parameter)
 * @return {function}
 * @closure
 */
function _gpfGetBootstrapMethod (path, methodFactory) {
    path = path.split(".");
    var name = path.pop(),
        namespace = _gpfContext(path, true),
        mustBootstrap = true,
        method;
    // The initial method is protected as the caller may keep its reference
    namespace[name] = function () {
        /* istanbul ignore else */ // Because that's the idea (shouldn't be called twice)
        if (mustBootstrap) {
            method = methodFactory(path);
            namespace[name] = method;
            mustBootstrap = false;
        }
        return method.apply(this, arguments);
    };
}
