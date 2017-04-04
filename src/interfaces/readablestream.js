/**
 * @file IReadableStream interface
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefineInterface*/ // Internal interface definition helper
/*global _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
/*#endif*/

/**
 * The Readable stream interface is the abstraction for a source of data that you are reading from.
 * In other words, data comes out of a Readable stream.
 *
 * @interface gpf.interfaces.IReadableStream
 */

/**
 * Read data from the underlying source
 *
 * @method gpf.interfaces.IReadableStream#read
 * @param {Number} [size=0] size Number of bytes to read, read as much as possible if 0
 * @return {Promise<Array>} Data array, empty if no more data
 */

_gpfDefineInterface("ReadableStream", _gpfSyncReadSourceJSON("interfaces/readablestream.json"));
