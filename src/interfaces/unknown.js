/**
 * @file IUnknown interface
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfCreateAbstractFunction*/ // Build a function that throws the abstractMethod exception
/*global _gpfDefine*/ // Shortcut for gpf.define
/*#endif*/

/**
 * Offers a way to access supported interfaces of an object
 *
 * @interface gpf.interfaces.IUnknown
 */
_gpfDefine({ /** @lends {gpf.interfaces.IUnknown} */
    $interface: "gpf.interfaces.IUnknown",

    /**
     * Retrieves an object supporting the requested interface (maybe the object itself)
     *
     * @param {Function} Interface specifier function
     * @return {Object} The object implementing the interface or null
     */
    queryInterface: _gpfCreateAbstractFunction(1)
});
