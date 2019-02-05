/**
 * @file IUnknown interface
 * @since 0.1.8
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefineInterface*/ // Internal interface definition helper
/*global _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
/*#endif*/

/**
 * Offers a way to access supported interfaces of an object
 *
 * @interface gpf.interfaces.IUnknown
 * @since 0.1.8
 */

/**
 * Retrieves an object supporting the requested interface (maybe the object itself)
 *
 * @method gpf.interfaces.IUnknown#queryInterface
 * @param {Function} Interface specifier function
 * @return {Object} The object implementing the interface or null
 * @since 0.1.8
 */

_gpfDefineInterface("Unknown", _gpfSyncReadSourceJSON("interfaces/unknown.json"));

/*#ifndef(UMD)*/

// Generates an empty function to reflect the null complexity of this module
(function _gpfInterfacesUnknown () {}());

/*#endif*/
