/**
 * @file Stream piping
 */
/*#ifndef(UMD)*/
"use strict";
//*global _gpfQueryInterface*/ // gpf.interfaces.query
/*exported _gpfStreamPipe*/ // gpf.stream.pipe
/*#endif*/

/**
 * Pipe streams.
 *
 * @param {gpf.interfaces.IReadableStream} source Source stream
 * @param {...gpf.interfaces.IWritableStream} destination Writable streams
 * @return {Promise} Resolved when reading (and subsequent writings) are done
 */
function _gpfStreamPipe (source, destination) {
    return Promise.resolve();
}

/** @gpf:sameas _gpfStreamPipe */
gpf.stream.pipe = _gpfStreamPipe;
