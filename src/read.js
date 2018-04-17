/**
 * @file File system read
 * @since 0.1.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfHost*/ // Host type
/*exported _gpfRead*/ // Generic read method
/*exported _gpfReadSetImplIf*/ // Set the read implementation if the host matches
/*#endif*/

/**
 * {@see gpf.read} per host
 *
 * @type {Object}
 * @since 0.2.2
 */
var _gpfReadImpl = {};

/**
 * Set the read implementation if the host matches
 *
 * @param {String} host host to test, if matching with the current one, the read implementation is set
 * @param {Function} readImpl read implementation function
 * @since 0.2.6
 */
function _gpfReadSetImplIf (host, readImpl) {
    if (host === _gpfHost) {
        _gpfReadImpl = readImpl;
    }
}

/**
 * Generic read method
 *
 * @param {String} path File path
 * @return {Promise<String>} Resolved with the file content
 * @since 0.2.2
 */
function _gpfRead (path) {
    return _gpfReadImpl(path);
}

/**
 * @gpf:sameas _gpfRead
 * @since 0.2.6
 */
gpf.read = _gpfRead;

/* istanbul ignore else */ // flavor.1
if (gpf.fs) {

    /**
     * @gpf:sameas _gpfRead
     * @since 0.2.2
     * @deprecated since version 0.2.6, use {@link gpf.read} instead
     */
    gpf.fs.read = _gpfRead;

}
