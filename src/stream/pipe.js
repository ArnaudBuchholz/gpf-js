/**
 * @file Pipes for streams
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_EVENT_ANY*/ // gpf.events.EVENT_ANY
/*global _GPF_EVENT_DATA*/ // gpf.events.EVENT_DATA
/*global _GPF_EVENT_END_OF_DATA*/ // gpf.events.EVENT_END_OF_DATA
/*global _GPF_EVENT_READY*/ // gpf.events.EVENT_READY
/*global _GPF_STREAM_DEFAULT_READ_SIZE*/ // Global default for stream read size
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _gpfI*/ // gpf.interfaces
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfQueryInterface*/ // gpf.interfaces.query
/*exported _gpfStreamPipe*/ // gpf.stream.pipe
/*#endif*/

/**
 * @inheritdoc _gpfStreamPipe
 * @constructor
 */
function _GpfStreamPipe (configuration, eventsHandler) {
    /*jshint validthis:true*/ // constructor
    this._readable = _gpfQueryInterface(configuration.readable, _gpfI.IReadableStream, true);
    this._writable = _gpfQueryInterface(configuration.writable, _gpfI.IWritableStream, true);
    if (undefined !== configuration.chunkSize) {
        this._chunkSize = configuration.chunkSize;
    }
    this._eventsHandler = eventsHandler;
}

_GpfStreamPipe.prototype = {
    // @property {gpf.interfaces.IReadableStream} Read stream
    _readable: null,        // Readable stream
    // @property {gpf.interfaces.IWritableStream} Write stream
    _writable: null,        // Writable stream
    // @property {Number} Buffer size to read data
    _chunkSize: _GPF_STREAM_DEFAULT_READ_SIZE,
    // @property {gpf.events.EventHandler} events handler
    _eventsHandler: null,   // Original
    // @property {_GpfStreamPipe} itself
    scope: null
};

// gpf.events.EVENT_READY event handler
_GpfStreamPipe.prototype[_GPF_EVENT_READY] = function (event) {
    _gpfIgnore(event);
    this._readable.read(this._chunkSize, this);
};

// gpf.events.EVENT_END_OF_DATA event handler
_GpfStreamPipe.prototype[_GPF_EVENT_END_OF_DATA] = function (event) {
    _gpfIgnore(event);
    _gpfEventsFire.call(this, _GPF_EVENT_READY, {}, this._eventsHandler);
};

// gpf.events.EVENT_DATA event handler
_GpfStreamPipe.prototype[_GPF_EVENT_DATA] = function (event) {
    var buffer = event.get("buffer");
    this._writable.write(buffer, this);
};

// gpf.events.EVENT_ANY event handler
_GpfStreamPipe.prototype[_GPF_EVENT_ANY] = function (event) {
    // Forward to original handler (error or data)
    _gpfEventsFire.call(this, event, {}, this._eventsHandler);
};

/**
 * Creates a pipe that transfer data from the readable stream to writable one
 *
 * @param {Object} configuration
 * - {gpf.interfaces.IReadableStream} readable The stream to read from
 * - {gpf.interfaces.IWritableStream} writable The stream to write to
 * - {Number} [chunkSize=_GPF_STREAM_DEFAULT_READ_SIZE] chunkSize Chunk size
 * @param {gpf.events.Handler} eventsHandler
 *
 * @event ready
 * The readable stream was written in the writable one
 */
function _gpfStreamPipe (configuration, eventsHandler) {
    var scope = new _GpfStreamPipe(configuration, eventsHandler);
    scope.ready();
}

gpf.stream.pipe = _gpfStreamPipe;
