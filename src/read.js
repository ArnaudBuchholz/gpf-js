/**
 * @file File system read
 * @since 0.1.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfHost*/ // Host type
/*exported _gpfRead*/ // Generic read method
/*exported _gpfReadImplByHost*/ // gpf.read per host
/*#endif*/

/**
 * {@see gpf.read} per host
 *
 * @type {Object}
 * @since 0.2.2
 */
var _gpfReadImplByHost = {};

/**
 * Generic read method
 *
 * @param {String} path File path
 * @return {Promise<String>} Resolved with the file content
 * @since 0.2.2
 */
function _gpfRead (path) {
    return _gpfReadImplByHost[_gpfHost](path);
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
