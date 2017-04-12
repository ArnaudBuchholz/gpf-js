/**
 * @file IReadableStream interface
 * @since 0.1.9
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
 * @since 0.1.9
 */

/**
 * Read all data from the underlying source. Chunk of data is passed to the {@see gpf.interfaces.IWritableStream}.
 *
 * @method gpf.interfaces.IReadableStream#read
 * @param {gpf.interfaces.IWritableStream} output Stream that receives chunk of data
 * @return {Promise} Resolved when the stream has ended
 * @since 0.1.9
 */

_gpfDefineInterface("ReadableStream", _gpfSyncReadSourceJSON("interfaces/readablestream.json"));
