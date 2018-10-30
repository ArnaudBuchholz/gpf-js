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

function _gpfStreamQuery (queriedObject, interfaceSpecifier, interfaceName) {
    var iStream = _gpfInterfaceQuery(interfaceSpecifier, queriedObject);
    if (!iStream) {
        gpf.Error.interfaceExpected({
            name: interfaceName
        });
    }
    return iStream;
}

function _gpfStreamQueryCommon (queriedObject, interfaceSpecifier, interfaceName) {
    if (!queriedObject) {
        gpf.Error.interfaceExpected({
            name: interfaceName
        });
    }
    return _gpfStreamQuery(queriedObject, interfaceSpecifier, interfaceName);
}

/**
 * Get an IReadableStream or fail if not implemented
 *
 * @param {Object} queriedObject Object to query
 * @return {gpf.interfaces.IReadableStream} IReadableStream interface
 * @throws {gpf.Error.InterfaceExpected}
 * @since 0.1.9
 */
function _gpfStreamQueryReadable (queriedObject) {
    return _gpfStreamQueryCommon(queriedObject, _gpfIReadableStream, "gpf.interfaces.IReadableStream");
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
    return _gpfStreamQueryCommon(queriedObject, _gpfIWritableStream, "gpf.interfaces.IWritableStream");
}

/* 'Hidden' properties used to secure Read / Write operations */
var _gpfStreamProgressPropertyNamePrefix = "gpf.stream#progress",
    _gpfStreamProgressRead = _gpfStreamProgressPropertyNamePrefix + "/read",
    _gpfStreamProgressWrite = _gpfStreamProgressPropertyNamePrefix + "/write";

/**
 * Install the progress flag used by _gpfStreamSecureRead and Write
 *
 * @param {Function} constructor Class constructor
 * @since 0.1.9
 */
function _gpfStreamSecureInstallProgressFlag (constructor) {
    constructor.prototype[_gpfStreamProgressRead] = false;
    constructor.prototype[_gpfStreamProgressWrite] = false;
}

function _gpfStreamSecureStart (stream, flag, error) {
    if (stream[flag]) {
        gpf.Error[error]();
    }
    stream[flag] = true;
}

/**
 * Starts a secured read operation (if possible)
 *
 * @param {Object} stream configured with {@see _gpfStreamSecureInstallProgressFlag}
 * @throws {gpf.Error.ReadInProgress}
 * @since 0.2.3
 */
function _gpfStreamProgressStartRead (stream) {
    _gpfStreamSecureStart(stream, _gpfStreamProgressRead, "readInProgress");
}

/**
 * Ends a read operation
 *
 * @param {Object} stream configured with {@see _gpfStreamSecureInstallProgressFlag}
 * @since 0.2.3
 */
function _gpfStreamProgressEndRead (stream) {
    stream[_gpfStreamProgressRead] = false;
}

/**
 * Starts a secured write operation (if possible)
 *
 * @param {Object} stream configured with {@see _gpfStreamSecureInstallProgressFlag}
 * @throws {gpf.Error.WriteInProgress}
 * @since 0.2.3
 */
function _gpfStreamProgressStartWrite (stream) {
    _gpfStreamSecureStart(stream, _gpfStreamProgressWrite, "writeInProgress");
}

/**
 * Ends a write operation
 *
 * @param {Object} stream configured with {@see _gpfStreamSecureInstallProgressFlag}
 * @since 0.2.3
 */
function _gpfStreamProgressEndWrite (stream) {
    stream[_gpfStreamProgressWrite] = false;
}

function _gpfStreamSecureEnd (promise, stream, endMethod) {
    return promise.then(function (result) {
        endMethod(stream);
        return Promise.resolve(result);
    }, function (reason) {
        endMethod(stream);
        return Promise.reject(reason);
    });
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
        var me = this, //eslint-disable-line no-invalid-this
            iWritableStream = _gpfStreamQueryWritable(output);
        _gpfStreamProgressStartRead(me);
        return _gpfStreamSecureEnd(read.call(me, iWritableStream), me, _gpfStreamProgressEndRead);
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
        _gpfStreamProgressStartWrite(me);
        return _gpfStreamSecureEnd(write.call(me, buffer), me, _gpfStreamProgressEndWrite);
    };
}

/*#ifndef(UMD)*/

gpf.internals._gpfStreamQueryReadable = _gpfStreamQueryReadable;
gpf.internals._gpfStreamQueryWritable = _gpfStreamQueryWritable;
gpf.internals._gpfStreamSecureInstallProgressFlag = _gpfStreamSecureInstallProgressFlag;
gpf.internals._gpfStreamSecureRead = _gpfStreamSecureRead;
gpf.internals._gpfStreamSecureWrite = _gpfStreamSecureWrite;

/*#endif*/
