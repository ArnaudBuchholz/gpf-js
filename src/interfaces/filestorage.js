/**
 * @file IFileStorage interface
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfCreateAbstractFunction*/ // Build a function that throws the abstractMethod exception
/*global _gpfDefine*/ // Shortcut for gpf.define
/*exported _GPF_FS_TYPESS*/ // File system types constants
/*exported _GPF_FS_OPENFOR*/ // File system stream opening mode
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

    };

/**
 * @namespace gpf.fs
 * @description Root namespace for filesystem specifics
 * @since 0.1.5
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
    }

};

/**
 * @typedef gpf.typedef.fileStorageInfo
 * @property {gpf.fs.types} type See gpf.fs.types
 * @property {String} fileName file name only
 * @property {String} filePath full path to the file
 * @property {Number} size Size of the object (if relevant)
 * @property {Date} createdDateTime
 * @property {Date} modifiedDateTime
 */

/**
 * File Storage interface, defines base methods to access any kind of file storage
 *
 * @interface gpf.interfaces.IFileStorage
 */
_gpfDefine({
    $interface: "gpf.interfaces.IFileStorage",

    /**
     * Get information on the storage path
     *
     * @method gpf.interfaces.IFileStorage#getInfo
     * @param {String} path Storage path to get info from
     * @return {Promise<gpf.typedef.fileStorageInfo>} information
     */
    getInfo: _gpfCreateAbstractFunction(1),

    /**
     * Open storage path content as a text stream
     *
     * @method gpf.interfaces.IFileStorage#openTextStream
     * @param {String} path Storage path to open stream on
     * @param {gpf.fs.openFor} mode Switch between reading and appending
     * @return {Promise<gpf.interfaces.IReadableStream|gpf.interfaces.IWritableStream>} Stream to the file
     */
    openTextStream: _gpfCreateAbstractFunction(2),

    /**
     * Close the underlying file: the stream becomes unusable
     *
     * @method gpf.interfaces.IFileStorage#close
     * @param {gpf.interfaces.IReadableStream|gpf.interfaces.IWritableStream} stream Stream to close
     * @return {Promise} Resolved when closed
     */
    close: _gpfCreateAbstractFunction(1),

    /**
     * Provide information on the content of a directory through an IEnumerator
     *
     * @method gpf.interfaces.IFileStorage#explore
     * @param {String} path Storage path to a directory to explore
     * @return {Promise<gpf.interfaces.IEnumerator>} Enumerator interface to get directory content names
     */
    explore: _gpfCreateAbstractFunction(1),

    /**
     * Creates a directory
     *
     * @method gpf.interfaces.IFileStorage#createDirectory
     * @param {String} path Storage path of the directory to create
     * @return {Promise} Resolved when created
     */
    createDirectory: _gpfCreateAbstractFunction(1),

    /**
     * Deletes a file
     *
     * @method gpf.interfaces.IFileStorage#deleteFile
     * @param {String} path Storage path to the file
     * @return {Promise} Resolved when deleted
     */
    deleteFile: _gpfCreateAbstractFunction(1),

    /**
     * Deletes a directory
     *
     * @method gpf.interfaces.IFileStorage#deleteDirectory
     * @param {String} path Storage path to the directory
     * @return {Promise} Resolved when deleted
     */
    deleteDirectory: _gpfCreateAbstractFunction(1)

});
