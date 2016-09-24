/**
 * @file Control of the gpf variable
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfMainContext*/ // Main context object
/*eslint valid-jsdoc: 2*/
/*#endif*/

var /**
     * To implement gpf.noConflict(), we need to keep the previous content of gpf.
     * Makes sense only for the following hosts:
     * - phantomjs
     * - browser
     * - unknown
     *
     * @type {undefined|Object}
     * @private
     */
    _gpfConflictingSymbol;

/*#ifdef(UMD)*/

_gpfConflictingSymbol = _gpfMainContext.gpf;

/* istanbul ignore next */ // web only
/**
 * Relinquish control of the gpf variable.
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
