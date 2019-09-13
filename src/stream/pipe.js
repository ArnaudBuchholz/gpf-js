/**
 * @file Stream piping
 * @since 0.2.3
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_START*/ // 0
/*global _gpfAssert*/ // Assertion method
/*global _gpfArrayTail*/ // [].slice.call(,1)
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfGetFunctionName*/ // Get the function name
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

/*#ifdef(DEBUG)*/

function _gpfStreamPipeCouplerDebug (coupler, message) {
    _gpfIgnore(coupler, message);
    // if (console.expects) {
    //     console.expects("log", /.*/, true);
    // }
    // console.log("gpf.stream.pipe/coupler@" + coupler.index + " [" + coupler.fromName + "::" + coupler.toName + "] "
    //     + message);
}

/*#endif*/

function _gpfStreamPipeAllocateCoupler (intermediate, destination) {
/*#ifdef(DEBUG)*/
    var toName;
    if (destination._isCoupler === _gpfStreamPipeCouplerDebug) {
        toName = "(coupler)";
    } else {
        toName = _gpfGetFunctionName(destination.constructor);
    }
    /*#endif*/
    return {
        /*#ifdef(DEBUG)*/
        from: intermediate,
        fromName: _gpfGetFunctionName(intermediate.constructor),
        to: destination,
        toName: toName,
        /*#endif*/
        iReadableIntermediate: _gpfStreamQueryReadable(intermediate),
        iWritableIntermediate: _gpfStreamQueryWritable(intermediate),
        iFlushableIntermediate: _gpfStreamPipeToFlushable(intermediate),
        iWritableDestination: _gpfStreamQueryWritable(destination),
        iFlushableDestination: _gpfStreamPipeToFlushable(destination),
        readInProgress: false,
        readError: null,
        readPromise: Promise.resolve(),
        rejectWrite: _gpfEmptyFunc,
        flushed: false
    };
}

function _gpfStreamPipeCouplerDrain (coupler) {
    // Read errors must be transmitted up to the initial read, this is done by forwarding it to flush & write
    var iReadableIntermediate = coupler.iReadableIntermediate,
        iWritableDestination = coupler.iWritableDestination;
    /*#ifdef(DEBUG)*/
    if (coupler.readInProgress) {
        _gpfStreamPipeCouplerDebug(coupler, "read in progress");
    }
    /*#endif*/
    if (!coupler.readInProgress) {
        try {
            coupler.readInProgress = true;
            /*#ifdef(DEBUG)*/
            _gpfStreamPipeCouplerDebug(coupler, "read started");
            /*#endif*/
            coupler.readPromise = iReadableIntermediate.read(iWritableDestination)
                .then(function () {
                    /*#ifdef(DEBUG)*/
                    _gpfStreamPipeCouplerDebug(coupler, "read ended");
                    /*#endif*/
                    coupler.readInProgress = false;
                }, function (reason) {
                    coupler.readError = reason;
                    coupler.rejectWrite(reason);
                });
        } catch (e) {
            coupler.readError = e;
        }
    }
}

function _gpfStreamPipeCouplerWrite (coupler, promise) {
    return new Promise(function (resolve, reject) {
        promise.then(function (value) {
            resolve(value);
            coupler.rejectWrite = _gpfEmptyFunc;
        }, reject);
        coupler.rejectWrite = reject;
    });
}

function _gpfStreamPipeCheckIfReadError (coupler) {
    if (coupler.readError) {
        return Promise.reject(coupler.readError);
    }
}

/**
 * Create a flushable & writable stream by coupling the intermediate stream with the writable destination
 *
 * @param {Object} intermediate Must implements IReadableStream interface.
 * If it implements the IFlushableStream interface, it is assumed that it retains data
 * until it receives the Flush. Meaning, the read won't complete until the flush call.
 * If it does not implement the IFlushableStream, the read may end before the whole sequence
 * has finished. It means that the next write should trigger a new read and flush must be simulated at
 * least to pass it to the destination
 * @param {Object} destination Must implements IWritableStream interface.
 * If it implements the IFlushableStream, it will be called when the intermediate completes.
 * @param {Number} index zero-based index of the coupler, helps for debugging.
 *
 * @return {Object} Implementing IWritableStream and IFlushableStream
 * @since 0.2.3
 */
function _gpfStreamPipeWeldCoupler (intermediate, destination, index) {
    var coupler = _gpfStreamPipeAllocateCoupler(intermediate, destination),
        iFlushableIntermediate = coupler.iFlushableIntermediate,
        iFlushableDestination = coupler.iFlushableDestination,
        iWritableIntermediate = coupler.iWritableIntermediate;

    /*#ifdef(DEBUG)*/
    coupler.index = index;
    /*#endif*/

    _gpfStreamPipeCouplerDrain(coupler);

    return {
        /*#ifdef(DEBUG)*/
        _isCoupler: _gpfStreamPipeCouplerDebug,
        /*#endif*/

        flush: function () {
            _gpfAssert(!coupler.flushed, "A flushed coupler can't be flushed again");
            /*#ifdef(DEBUG)*/
            _gpfStreamPipeCouplerDebug(coupler, "flush");
            /*#endif*/
            coupler.flushed = true;
            return _gpfStreamPipeCheckIfReadError(coupler) || iFlushableIntermediate.flush()
                .then(function () {
                    return coupler.readPromise; // Wait for any pending read
                })
                .then(function () {
                    return iFlushableDestination.flush();
                    /*#ifdef(DEBUG)*/
                })
                .then(function () {
                    _gpfStreamPipeCouplerDebug(coupler, "flush ended");
                    /*#endif*/
                });
        },

        write: function (data) {
            _gpfAssert(!coupler.flushed, "A flushed coupler can't be written to");
            /*#ifdef(DEBUG)*/
            _gpfStreamPipeCouplerDebug(coupler, "write(" + JSON.stringify(data) + ")");
            /*#endif*/
            _gpfStreamPipeCouplerDrain(coupler);
            return _gpfStreamPipeCheckIfReadError(coupler)
                || _gpfStreamPipeCouplerWrite(coupler, iWritableIntermediate.write(data));
        }

    };
}

function _gpfStreamPipeWeldCouplers (streams) {
    var idx = streams.length,
        iWritableStream = streams[--idx];
    while (idx) {
        iWritableStream = _gpfStreamPipeWeldCoupler(streams[--idx], iWritableStream, idx);
    }
    return iWritableStream;
}

function _gpfStreamPipeToWritable (streams) {
    if (_gpfArrayTail(streams).length) {
        return _gpfStreamPipeWeldCouplers(streams);
    }
    return _gpfStreamQueryWritable(streams[_GPF_START]);
}

/**
 * Pipe streams.
 *
 * @param {gpf.interfaces.IReadableStream} source Source stream
 * @param {...gpf.interfaces.IWritableStream} destination streams to pipe data through.
 * It is assumed that the last destination stream will not block data receiving if readable),
 * every other intermediate stream must also implement {@link gpf.interfaces.IReadableStream} interface
 * @return {Promise} Resolved when reading (and subsequent writings) are done
 * @since 0.2.3
 */
function _gpfStreamPipe (source, destination) {
    _gpfIgnore(destination);
    var iReadableStream = _gpfStreamQueryReadable(source),
        iWritableStream = _gpfStreamPipeToWritable(_gpfArrayTail(arguments)),
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
