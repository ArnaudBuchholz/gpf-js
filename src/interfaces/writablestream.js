/**
 * @file IWritableStream interface
 * @since 0.1.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefineInterface*/ // Internal interface definition helper
/*global _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
/*exported _gpfIWritableStream*/ // gpf.interfaces.IWritableStream
/*#endif*/

/**
 * The Writable stream interface is an abstraction for a destination that you are writing data to.
 *
 * @interface gpf.interfaces.IWritableStream
 * @since 0.1.9
 */

/**
 * Write data to the underlying destination
 *
 * @method gpf.interfaces.IWritableStream#write
 * @param {*} data Data to write
 * @return {Promise} Resolved when ready
 * @since 0.1.9
 */

/**
 * IWritableStream interface specifier
 *
 * @type {gpf.interfaces.IWritableStream}
 * @since 0.1.9
 */
var _gpfIWritableStream = _gpfDefineInterface("WritableStream",
    _gpfSyncReadSourceJSON("interfaces/writablestream.json"));

/*#ifndef(UMD)*/

// Generates an empty function to reflect the null complexity of this module
(function _gpfInterfacesWritablestream () {}());

/*#endif*/
