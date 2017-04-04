/**
 * @file IWritableStream interface
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefineInterface*/ // Internal interface definition helper
/*global _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
/*#endif*/

/**
 * The Writable stream interface is an abstraction for a destination that you are writing data to.
 *
 * @interface gpf.interfaces.IWritableStream
 */

/**
 * Write data to the underlying destination
 *
 * @method gpf.interfaces.IWritableStream#write
 * @param {Array} data Data array
 * @return {Promise} Resolved when ready
 */

_gpfDefineInterface("WritableStream", _gpfSyncReadSourceJSON("interfaces/writablestream.json"));
