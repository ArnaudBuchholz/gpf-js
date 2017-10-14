/**
 * @file File system implementation
 * @since 0.1.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfStreamWritableString*/ // gpf.stream.WritableString
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfHost*/ // Host type
/*exported _GPF_FS_OPENFOR*/ // File system stream opening mode
/*exported _GPF_FS_TYPES*/ // File system types constants
/*exported _gpfFileStorageByHost*/ // gpf.interfaces.IFileStorage per host
/*exported _gpfFileStorageRead*/ // Generic read method using FileStorage
/*exported _gpfFsRead*/ // Generic read method
/*exported _gpfFsReadImplByHost*/ // gpf.fs.read per host
/*#endif*/

_gpfErrorDeclare("fs", {

    /**
     * ### Summary
     *
     * Incompatible stream
     *
     * ### Description
     *
     * This error is used when a file storage tries to close a stream that was not allocaetd by itself.
     * @since 0.1.9
     */
    incompatibleStream:
        "Incompatible stream"
});

var
    /**
     * File system type constants
     * @since 0.1.9
     */
    _GPF_FS_TYPES = {
        NOT_FOUND: 0,
        DIRECTORY: 1,
        FILE: 2,
        UNKNOWN: 3

    },

    /**
     * File system stream opening mode
     * @since 0.1.9
     */
    _GPF_FS_OPENFOR = {
        READING: 0,
        APPENDING: 1

    },

    /**
     * {@see gpf.interfaces.IFileStorage} per host
     *
     * @type {Object}
     * @since 0.2.1
     */
    _gpfFileStorageByHost = {},

    /**
     * {@see gpf.fs.read} per host
     *
     * @type {Object}
     * @since 0.2.2
     */
    _gpfFsReadImplByHost = {};

/**
 * Generic read method using FileStorage
 *
 * @param {String} path File path
 * @return {Promise<String>} Resolved with the file content
 * @since 0.2.2
 */
function _gpfFileStorageRead (path) {
    var fs = _gpfFileStorageByHost[_gpfHost],
        iWritableStream = new _GpfStreamWritableString();
    return fs.openTextStream(path, _GPF_FS_OPENFOR.READING)
        .then(function (iReadStream) {
            return iReadStream.read(iWritableStream);
        })
        .then(function () {
            return iWritableStream.toString();
        });
}

/**
 * Generic read method
 *
 * @param {String} path File path
 * @return {Promise<String>} Resolved with the file content
 * @since 0.2.2
 */

function _gpfFsRead (path) {
    return _gpfFsReadImplByHost[_gpfHost](path);
}

/**
 * @namespace gpf.fs
 * @description Root namespace for filesystem specifics
 * @since 0.1.9
 */
gpf.fs = {

    /**
     * File system object type enumeration
     *
     * @enum {Number}
     * @readonly
     * @since 0.1.9
     */
    types: {

        /**
         * Storage path does not exist
         * @since 0.1.9
         */
        notFound: _GPF_FS_TYPES.NOT_FOUND,

        /**
         * Storage path points to a container of files
         * @since 0.1.9
         */
        directory: _GPF_FS_TYPES.DIRECTORY,

        /**
         * Storage path points to a stream-able file
         * @since 0.1.9
         */
        file: _GPF_FS_TYPES.FILE,

        /**
         * Storage path points to an object but it can't be handled
         * @since 0.1.9
         */
        unknown: _GPF_FS_TYPES.UNKNOWN
    },

    /**
     * File system open mode enumeration
     *
     * @enum {Number}
     * @readonly
     * @since 0.1.9
     */
    openFor: {
        /**
         * Read as a IReadableStream from the beginning of the file
         * @since 0.1.9
         */
        reading: _GPF_FS_OPENFOR.READING,

        /**
         * Append as a IWritableStream to the end of the file.
         * NOTE: if you want to overwrite a file, delete it first
         * @since 0.1.9
         */
        appending: _GPF_FS_OPENFOR.APPENDING
    },

    /**
     * Get the current host file storage (null if none)
     *
     * @return {gpf.interfaces.IFileStorage|null} IFileStorage interface
     * @since 0.1.9
     */
    getFileStorage: function () {
        return _gpfFileStorageByHost[_gpfHost] || null;
    },

    /**
     * @gpf:sameas _gpfFsRead
     * @since 0.2.2
     */
    read: _gpfFsRead

};
