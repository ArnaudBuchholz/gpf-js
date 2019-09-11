/**
 * @file IFlushableStream interface
 * @since 0.2.2
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
 * @since 0.2.2
 */

/**
 * Request buffered data to be flushed. It does not need to wait for subsequent reads.
 *
 * @method gpf.interfaces.IFlushableStream#flush
 * @return {Promise} Resolved when ready
 * @since 0.2.2
 */

/**
 * IFlushableStream interface specifier
 *
 * @type {gpf.interfaces.IFlushableStream}
 * @since 0.2.2
 */
var _gpfIFlushableStream = _gpfDefineInterface("FlushableStream",
    _gpfSyncReadSourceJSON("interfaces/flushablestream.json"));

/*#ifndef(UMD)*/

// Generates an empty function to reflect the null complexity of this module
(function _gpfInterfacesFlushablestream () {}());

/*#endif*/
