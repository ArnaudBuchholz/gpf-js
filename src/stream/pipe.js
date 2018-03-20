/**
 * @file Stream piping
 * @since 0.2.3
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfIFlushableStream*/ // gpf.interfaces.IFlushableStream
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfInterfaceQuery*/ // gpf.interfaces.query
/*global _gpfStreamQueryReadable*/ // Get an IReadableStream or fail if not implemented
/*global _gpfStreamQueryWritable*/ // Get an IWritableStream or fail if not implemented
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
 * @since 0.2.3
 */
function _gpfStreamPipeToFlushableWrite (intermediate, destination) {
    var iReadableIntermediate = _gpfStreamQueryReadable(intermediate),
        iWritableIntermediate = _gpfStreamQueryWritable(intermediate),
        iFlushableIntermediate = _gpfStreamPipeToFlushable(intermediate),
        iWritableDestination = _gpfStreamQueryWritable(destination),
        iFlushableDestination = _gpfStreamPipeToFlushable(destination),
        readingDone = true,
        readError,
        rejectWrite = _gpfEmptyFunc;

    // Read errors must be transmitted up to the initial read, this is done by forwarding it to flush & write
    function _read () {
        if (readingDone) {
            try {
                readingDone = false;
                iReadableIntermediate.read(iWritableDestination)
                    .then(function () {
                        readingDone = true;
                    }, function (reason) {
                        readError = reason;
                        rejectWrite(reason);
                    });
            } catch (e) {
                readError = e;
            }
        }
    }
    _read();

    function _checkIfReadError () {
        if (readError) {
            return Promise.reject(readError);
        }
    }

    function _wrapWrite (writePromise) {
        return new Promise(function (resolve, reject) {
            writePromise.then(function (value) {
                resolve(value);
                rejectWrite = _gpfEmptyFunc;
            }, reject);
            rejectWrite = reject;
        });
    }

    return {

        flush: function () {
            return _checkIfReadError() || iFlushableIntermediate.flush()
                .then(function () {
                    return iFlushableDestination.flush();
                });
        },

        write: function (data) {
            _read();
            return _checkIfReadError() || _wrapWrite(iWritableIntermediate.write(data));
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

function _gpfStreamPipeToWritable (streams) {
    if (streams.length > 1) {
        return _gpfStreamPipeReduce(streams);
    }
    return _gpfStreamQueryWritable(streams[0]);
}

/**
 * Pipe streams.
 *
 * @param {gpf.interfaces.IReadableStream} source Source stream
 * @param {...gpf.interfaces.IWritableStream} destination Writable streams
 * @return {Promise} Resolved when reading (and subsequent writings) are done
 * @since 0.2.3
 */
function _gpfStreamPipe (source, destination) {
    _gpfIgnore(destination);
    var iReadableStream = _gpfStreamQueryReadable(source),
        iWritableStream = _gpfStreamPipeToWritable([].slice.call(arguments, 1)),
        iFlushableStream = _gpfStreamPipeToFlushable(iWritableStream);
    try {
        return iReadableStream.read(iWritableStream)
            .then(function () {
                return iFlushableStream.flush();
            });
    } catch (e) {
        return Promise.reject(e);
    }
}

/**
 * @gpf:sameas _gpfStreamPipe
 * @since 0.2.3
 */
gpf.stream.pipe = _gpfStreamPipe;
