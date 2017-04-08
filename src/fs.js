/**
 * @file File system implementation
 * @since 0.1.9
 */
/*#ifndef(UMD)*/
"use strict";
/*exported _gpfSetHostFileStorage*/ // Set the result of gpf.fs.getFileStorage
/*exported _GPF_FS_OPENFOR*/ // File system stream opening mode
/*exported _GPF_FS_TYPESS*/ // File system types constants
/*#endif*/

var
    /**
     * File system type constants
     */
    _GPF_FS_TYPES = {
        NOT_FOUND: 0,
        DIRECTORY: 1,
        FILE: 2,
        UNKNOWN: 3

    },

    /**
     * File system stream opening mode
     */
    _GPF_FS_OPENFOR = {
        READING: 0,
        APPENDING: 1

    },

    /**
     * Host file storage
     *
     * @type {gpf.interfaces.IFileStorage}
     */
    _gpfHostFileStorage = null;

/**
 * @namespace gpf.fs
 * @description Root namespace for filesystem specifics
 */
gpf.fs = {

    /**
     * File system object type enumeration
     *
     * @enum {Number}
     * @readonly
     */
    types: {

        /**
         * Storage path does not exist
         */
        notFound: _GPF_FS_TYPES.NOT_FOUND,

        /**
         * Storage path points to a container of files
         */
        directory: _GPF_FS_TYPES.DIRECTORY,

        /**
         * Storage path points to a stream-able file
         */
        file: _GPF_FS_TYPES.FILE,

        /**
         * Storage path points to an object but it can't be handled
         */
        unknown: _GPF_FS_TYPES.UNKNOWN
    },

    /**
     * File system open mode enumeration
     *
     * @enum {Number}
     * @readonly
     */
    openFor: {
        /**
         * Read as a IReadableStream from the beginning of the file
         */
        reading: _GPF_FS_OPENFOR.READING,

        /**
         * Append as a IWritableStream to the end of the file.
         * NOTE: if you want to overwrite a file, delete it first
         */
        appending: _GPF_FS_OPENFOR.APPENDING
    },

    /**
     * Get the current host file storage (null if none)
     *
     * @return {gpf.interfaces.IFileStorage} IFileStorage interface
     */
    getFileStorage: function () {
        return _gpfHostFileStorage;
    }

};

/**
 * Set the result of {@see gpf.fs.getFileStorage}
 *
 * @param {gpf.interfaces.IFileStorage} iFileStorage object implementing IFileStorage
 */
function _gpfSetHostFileStorage (iFileStorage) {
    _gpfHostFileStorage = iFileStorage;
}
