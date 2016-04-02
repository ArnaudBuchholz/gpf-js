/*#ifndef(UMD)*/
"use strict";
/*global _gpfMainContext*/ // Main context object
/*exported _gpfResolveScope*/ // Translate the parameter into a valid scope
/*#endif*/

/**
 * Translate the parameter into a valid scope
 *
 * @param {*} scope
 */
function _gpfResolveScope (scope) {
    if (null === scope || "object" !== typeof scope) {
        return _gpfMainContext;
    }
    return scope;
}

/*#ifndef(UMD)*/

gpf.internals._gpfResolveScope = _gpfResolveScope;

/*#endif*/
