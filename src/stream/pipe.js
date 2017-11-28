/**
 * @file Stream piping
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfStreamQueryReadable*/ // Get an IReadableStream or fail if not implemented
/*global _gpfStreamQueryWritable*/ // Get an IWritableStream or fail if not implemented
/*global _gpfInterfaceQuery*/ // gpf.interfaces.query
/*global _gpfIFlushableStream*/ // gpf.interfaces.IFlushableStream
/*exported _gpfStreamPipe*/ // gpf.stream.pipe
/*#endif*/

var _gpfStreamPipeFakeFlushable = {
    flush: Promise.resolve.bind(Promise)
};

function _gpfStreamPipeToFlushable (stream) {
    return _gpfInterfaceQuery(_gpfIFlushableStream, stream) || _gpfStreamPipeFakeFlushable;
}

/**
 * Create a flushable & writable stream by combining the intermediate stream with the writable destination
 *
 * @param {Object} intermediate Must implements IReadableStream interface.
 * If it implements the IFlushableStream interface, it is assumed that it retains data
 * until it receives the Flush. Meaning, the read won't complete until the flush call.
 * If it does not implement the IFlushableStream, the read may end before the whole sequence
 * has finished. It means that the next write should trigger a new read and flush must be simulated at
 * least to pass it to the destination
 * @param {Object} destination Must implements IWritableStream interface.
 * If it implements the IFlushableStream, it will be called when the intermediate completes.
 *
 * @return {Object} Implementing IWritableStream and IFlushableStream
 */
function _gpfStreamPipeToFlushableWrite (intermediate, destination) {
    var iReadableIntermediate = _gpfStreamQueryReadable(intermediate),
        iWritableIntermediate = _gpfStreamQueryWritable(intermediate),
        iFlushableIntermediate = _gpfStreamPipeToFlushable(intermediate),
        iWritableDestination = _gpfStreamQueryWritable(destination),
        iFlushableDestination = _gpfStreamPipeToFlushable(destination);

    iReadableIntermediate.read(iWritableDestination);
    return {

        flush: function () {
            return iFlushableIntermediate.flush()
                .then(function () {
                    return iFlushableDestination.flush();
                });
        },

        write: function (data) {
            return iWritableIntermediate.write(data);
        }

    };
}

function _gpfStreamPipeReduce (streams) {
    var idx = streams.length - 1,
        iWritableStream = streams[idx];
    while (idx > 0) {
        iWritableStream = _gpfStreamPipeToFlushableWrite(streams[--idx], iWritableStream);
    }
    return iWritableStream;
}

/**
 * Pipe streams.
 *
 * @param {gpf.interfaces.IReadableStream} source Source stream
 * @param {...gpf.interfaces.IWritableStream} destination Writable streams
 * @return {Promise} Resolved when reading (and subsequent writings) are done
 */
function _gpfStreamPipe (source, destination) {
    var iReadableStream = _gpfStreamQueryReadable(source),
        iWritableStream;
    if (arguments.length > 2) {
        iWritableStream = _gpfStreamPipeReduce([].slice.call(arguments, 1));
    } else {
        iWritableStream = _gpfStreamQueryWritable(destination);
    }
    try {
        return iReadableStream.read(iWritableStream)
            .then(function () {
                var iFlushableStream = _gpfInterfaceQuery(_gpfIFlushableStream, iWritableStream);
                if (iFlushableStream) {
                    return iFlushableStream.flush();
                }
            });
    } catch (e) {
        return Promise.reject(e);
    }
}

/** @gpf:sameas _gpfStreamPipe */
gpf.stream.pipe = _gpfStreamPipe;
