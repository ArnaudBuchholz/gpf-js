/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefIntrf*/ // gpf.define for interfaces
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfI*/ // gpf.interfaces
/*#endif*/

/**
 * The Readable stream interface is the abstraction for a source of data
 * that you are reading from. In other words, data comes out of a Readable
 * stream.
 *
 * @class gpf.interfaces.IReadableStream
 * @extends gpf.interfaces.Interface
 */
_gpfDefIntrf("IReadableStream", {

    /**
     * Triggers the reading of data.
     * The expected behavior is:
     * - The callback is asynchronous
     * - One of the following callback must be called after a read
     *   - EVENT_ERROR: an error occurred.
     *     the stream can't be used after this.
     *   - EVENT_END_OF_DATA: stream ended.
     *     the stream can't be used after this.
     *   - EVENT_DATA: a buffer is provided, it can't be empty.
     *
     * @param {Number} [size=0] size Number of bytes to read. Read
     * as much as possible if 0
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event gpf.events.EVENT_DATA
     * Some data is ready to be used
     * @eventParam {gpf.IReadOnlyArray} buffer Bytes buffer
     *
     * @event gpf.events.EVENT_END_OF_DATA
     * No more data can be read from the stream
     */
    "[read]": [gpf.$ClassEventHandler()],
    read: function (size, eventsHandler) {
        _gpfIgnore(size);
        _gpfIgnore(eventsHandler);
    }

});

/**
 * The Writable stream interface is an abstraction for a destination that
 * you are writing data to.
 * The expected behavior is:
 * - The callback is asynchronous
 * - One of the following callback must be called after a read
 *   - EVENT_ERROR: an error occurred.
 *     the stream can't be used after this.
 *   - EVENT_READY: the write operation succeeded, the provided buffer has
 *     been fully written (otherwise an error is thrown)
 *
 * @class gpf.interfaces.IReadableStream
 * @extends gpf.interfaces.Interface
 */
_gpfDefIntrf("IWritableStream", {

    /**
     * Triggers the writing of data
     *
     * @param {IReadOnlyArray} int8buffer Buffer to write
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event gpf.events.EVENT_READY
     * it is appropriate to begin writing more data to the stream
     *
     */
    "[write]": [gpf.$ClassEventHandler()],
    write: function (int8buffer, eventsHandler) {
        _gpfIgnore(int8buffer);
        _gpfIgnore(eventsHandler);
    }

});

/**
 * The stream combines both IReadableStream and IWritableStream
 */
_gpfDefIntrf("IStream", {

    /**
     * @inheritDoc gpf.interfaces.IReadableStream:read
     */
    "[read]": [gpf.$ClassEventHandler()],
    read: function (size, eventsHandler) {
        _gpfIgnore(size);
        _gpfIgnore(eventsHandler);
    },

    /**
     * @inheritDoc gpf.interfaces.IWritableStream:write
     */
    "[write]": [gpf.$ClassEventHandler()],
    write: function (int8buffer, eventsHandler) {
        _gpfIgnore(int8buffer);
        _gpfIgnore(eventsHandler);
    }

});

/**
 * Text stream: instead of an int8 buffer, the interface handles strings
 *
 * @class gpf.interfaces.ITextStream
 * @extends gpf.interfaces.IStream
 *
 * @event data Some data is ready to be ready
 * @eventParam {String} buffer
 */
_gpfDefIntrf("ITextStream", _gpfI.IStream, {
});