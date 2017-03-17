/**
 * @file IUnknown interface
 * @since 0.1.8
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
 * @since 0.1.8
 */
_gpfDefine({
    $interface: "gpf.interfaces.IUnknown",

    /**
     * Retrieves an object supporting the requested interface (maybe the object itself)
     *
     * @method gpf.interfaces.IUnknown.queryInterface
     * @param {Function} Interface specifier function
     * @return {Object} The object implementing the interface or null
     * @since 0.1.8
     */
    queryInterface: _gpfCreateAbstractFunction(1)
});
