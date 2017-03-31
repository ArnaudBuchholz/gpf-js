/**
 * @file IReadableStream and IWritableStream interfaces
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfCreateAbstractFunction*/ // Build a function that throws the abstractMethod exception
/*global _gpfDefine*/ // Shortcut for gpf.define
/*#endif*/

/**
 * For streams, the buffer can be either a number array OR a string.
 * Both have length property and can be used with [] syntax.
 *
 * Each stream may have its own preferences (it's JavaScript after all).
 * I didn't want to make the interface too complex.
 * For write, the stream is allowed to reject the call if it does not receive the expected format.
 */

/**
 * The Readable stream interface is the abstraction for a source of data that you are reading from.
 * In other words, data comes out of a Readable stream.
 *
 * @interface gpf.interfaces.IReadableStream
 */
_gpfDefine({
    $interface: "gpf.interfaces.IReadableStream",

    /**
     * Read data from the underlying source
     *
     * @method gpf.interfaces.IReadableStream#read
     * @param {Number} [size=0] size Number of bytes to read, read as much as possible if 0
     * @return {Promise<Array>} Data array, empty if no more data
     */
    read: _gpfCreateAbstractFunction(1)

});

/**
 * The Writable stream interface is an abstraction for a destination that you are writing data to.
 *
 * @interface gpf.interfaces.IWritableStream
 */
_gpfDefine({
    $interface: "gpf.interfaces.IWritableStream",

    /**
     * Write data to the underlying destination
     *
     * @method gpf.interfaces.IWritableStream#write
     * @param {Array} data Data array
     * @return {Promise} Resolved when ready
     */
    write: _gpfCreateAbstractFunction(1)

});
