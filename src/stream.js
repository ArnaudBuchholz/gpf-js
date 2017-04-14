/**
 * @file Streams helpers
 * @since 0.1.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfIReadableStream*/ // gpf.interfaces.IReadableStream
/*global _gpfIWritableStream*/ // gpf.interfaces.IWritableStream
/*global _gpfInterfaceQuery*/ // gpf.interfaces.query
/*exported _GPF_STREAM_DEFAULT_READ_SIZE*/ // Global default for stream read size
/*exported _gpfStreamQueryReadable*/ // Get an IReadableStream or fail if not implemented
/*exported _gpfStreamQueryWritable*/ // Get an IWritableStream or fail if not implemented
/*exported _gpfStreamSecureInstallProgressFlag*/ // Install the progress flag used by _gpfStreamSecureRead and Write
/*exported _gpfStreamSecureRead*/ // Generate a wrapper to secure multiple calls to stream#read
/*exported _gpfStreamSecureWrite*/ // Generates a wrapper to secure multiple calls to stream#write
/*#endif*/

_gpfErrorDeclare("stream", {

    /**
     * ### Summary
     *
     * A read operation is already in progress
     *
     * ### Description
     *
     * This error is triggered if two reads are made simultaneously on the stream
     * @since 0.1.9
     */
    readInProgress:
        "A read operation is already in progress",

    /**
     * ### Summary
     *
     * A write operation is already in progress
     *
     * ### Description
     *
     * This error is triggered if two writes are made simultaneously on the stream
     * @since 0.1.9
     */
    writeInProgress:
        "A write operation is already in progress",

    /**
     * ### Summary
     *
     * Stream is in an invalid state
     *
     * ### Description
     *
     * If an error occurred while using the stream, no additional operations can be made
     * @since 0.1.9
     */
    invalidStreamState:
        "Stream is in an invalid state"
});

/**
 * @namespace gpf.stream
 * @description Root namespace for GPF streams
 * @since 0.1.9
 */
gpf.stream = {};

/**
 * Get an IReadableStream or fail if not implemented
 *
 * @param {Object} queriedObject Object to query
 * @return {gpf.interfaces.IReadableStream} IReadableStream interface
 * @throws {gpf.Error.InterfaceExpected}
 * @since 0.1.9
 */
function _gpfStreamQueryReadable (queriedObject) {
    var iReadableStream = _gpfInterfaceQuery(_gpfIReadableStream, queriedObject);
    if (!iReadableStream) {
        gpf.Error.interfaceExpected({
            name: "gpf.interfaces.IReadableStream"
        });
    }
    return iReadableStream;
}

/**
 * Get an IWritableStream or fail if not implemented
 *
 * @param {Object} queriedObject Object to query
 * @return {gpf.interfaces.IWritableStream} IWritableStream interface
 * @throws {gpf.Error.InterfaceExpected}
 * @since 0.1.9
 */
function _gpfStreamQueryWritable (queriedObject) {
    var iWritableStream = _gpfInterfaceQuery(_gpfIWritableStream, queriedObject);
    if (!iWritableStream) {
        gpf.Error.interfaceExpected({
            name: "gpf.interfaces.IWritableStream"
        });
    }
    return iWritableStream;
}

var _gpfStreamInProgressPropertyName = "gpf.stream#inProgress";

/**
 * Install the progress flag used by _gpfStreamSecureRead and Write
 *
 * @param {Function} constructor Class constructor
 * @since 0.1.9
 */
function _gpfStreamSecureInstallProgressFlag (constructor) {
    constructor.prototype[_gpfStreamInProgressPropertyName] = false;
}

/**
 * Generate a wrapper to query IWritableStream from the parameter and secure multiple calls to stream#read
 *
 * @param {Function} read Read function
 * @return {Function} Function exposing {@see gpf.interfaces.IReadableStream#read}
 * @gpf:closure
 * @since 0.1.9
 */
function _gpfStreamSecureRead (read) {
    return function (output) {
        var me = this; //eslint-disable-line no-invalid-this
        if (me[_gpfStreamInProgressPropertyName]) {
            gpf.Error.readInProgress();
        }
        var iWritableStream = _gpfStreamQueryWritable(output);
        me[_gpfStreamInProgressPropertyName] = true;
        return read.call(me, iWritableStream)
            .then(function (result) {
                me[_gpfStreamInProgressPropertyName] = false;
                return Promise.resolve(result);
            }, function (reason) {
                me[_gpfStreamInProgressPropertyName] = false;
                return Promise.reject(reason);
            });
    };
}

/**
 * Generate a wrapper to secure multiple calls to stream#write
 *
 * @param {Function} write Write function
 * @return {Function} Function exposing {@see gpf.interfaces.IWritableStream#write}
 * @gpf:closure
 * @since 0.1.9
 */
function _gpfStreamSecureWrite (write) {
    return function (buffer) {
        var me = this; //eslint-disable-line no-invalid-this
        if (me[_gpfStreamInProgressPropertyName]) {
            gpf.Error.writeInProgress();
        }
        me[_gpfStreamInProgressPropertyName] = true;
        return write.call(me, buffer) //eslint-disable-line no-invalid-this
            .then(function (result) {
                me[_gpfStreamInProgressPropertyName] = false;
                return Promise.resolve(result);
            }, function (reason) {
                me[_gpfStreamInProgressPropertyName] = false;
                return Promise.reject(reason);
            });
    };
}
