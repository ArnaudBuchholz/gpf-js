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
    var pathList = path.split("."),
        name = pathList.pop(),
        namespace = _gpfContext(pathList, true),
        method;
    // If someone stores the initial member, the factory will be called every time (simpler)
    namespace[name] = function () {
        method = methodFactory(path);
        namespace[name] = method;
        return method.apply(this, arguments);
    };
}

/*#ifndef(UMD)*/

gpf.internals._gpfGetBootstrapMethod = _gpfGetBootstrapMethod;

/*#endif*/
