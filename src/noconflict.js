/**
 * @file Control of the gpf variable
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfMainContext*/ // Main context object
/*#endif*/

var /**
     * To implement gpf.noConflict(), we need to keep the previous content of gpf.
     * Makes sense only for the following hosts:
     * - phantomjs
     * - browser
     * - unknown
     *
     * @type {undefined|Object}
     */
    _gpfConflictingSymbol;

/*#ifdef(UMD)*/

_gpfConflictingSymbol = _gpfMainContext.gpf;

/**
 * Relinquish control of the gpf variable.
 *
 * If for some reason two versions of the GPF library are loaded (which is **not** recommended),
 * calling gpf.noConflict() from the second version will return the globally scoped gpf variable to those of the first
 * version
 *
 * @return {Object} current GPF instance
 */
gpf.noConflict = function () {
    if (undefined === _gpfConflictingSymbol) {
        delete _gpfMainContext.gpf;
    } else {
        _gpfMainContext.gpf = _gpfConflictingSymbol;
    }
    return gpf;
};

/*#endif*/
