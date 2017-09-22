/**
 * @file IFlushableStream interface
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefineInterface*/ // Internal interface definition helper
/*global _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
/*exported _gpfIFlushableStream*/ // gpf.interfaces.IFlushableStream
/*#endif*/

/**
 * The Flushable stream interface defines a method to flush any buffered data
 *
 * @interface gpf.interfaces.IFlushableStream
 */

/**
 * Request buffered data to be flushed
 *
 * @method gpf.interfaces.IFlushableStream#flush
 * @return {Promise} Resolved when ready
 */

/**
 * IFlushableStream interface specifier
 *
 * @type {gpf.interfaces.IFlushableStream}
 */
var _gpfIFlushableStream = _gpfDefineInterface("FlushableStream",
    _gpfSyncReadSourceJSON("interfaces/flushablestream.json"));
