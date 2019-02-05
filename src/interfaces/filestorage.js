/**
 * @file IFileStorage interface
 * @since 0.1.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefineInterface*/ // Internal interface definition helper
/*global _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
/*#endif*/

/**
 * @typedef gpf.typedef.fileStorageInfo
 * @property {gpf.fs.types} type See gpf.fs.types
 * @property {String} fileName file name only
 * @property {String} filePath full path to the file
 * @property {Number} size Size of the object (if relevant)
 * @property {Date} createdDateTime
 * @property {Date} modifiedDateTime
 * @since 0.1.9
 */

/**
 * File Storage interface, defines base methods to access any kind of file storage
 *
 * @interface gpf.interfaces.IFileStorage
 * @since 0.1.9
 */

/**
 * Get information on the storage path
 *
 * @method gpf.interfaces.IFileStorage#getInfo
 * @param {String} path Storage path to get info from
 * @return {Promise<gpf.typedef.fileStorageInfo>} information
 * @since 0.1.9
 */

/**
 * Open storage path content as a text stream
 *
 * @method gpf.interfaces.IFileStorage#openTextStream
 * @param {String} path Storage path to open stream on
 * @param {gpf.fs.openFor} mode Switch between reading and appending
 * @return {Promise<gpf.interfaces.IReadableStream|gpf.interfaces.IWritableStream>} Stream to the file
 * @since 0.1.9
 */

/**
 * Close the underlying file: the stream becomes unusable
 *
 * @method gpf.interfaces.IFileStorage#close
 * @param {gpf.interfaces.IReadableStream|gpf.interfaces.IWritableStream} stream Stream to close
 * @return {Promise} Resolved when closed
 * @since 0.1.9
 */

/**
 * Provide information on the content of a directory through an IEnumerator
 *
 * @method gpf.interfaces.IFileStorage#explore
 * @param {String} path Storage path to a directory to explore
 * @return {Promise<gpf.interfaces.IEnumerator<gpf.typedef.fileStorageInfo>>} Enumerator interface to get directory
 * content names
 * @since 0.1.9
 */

/**
 * Create a directory
 *
 * @method gpf.interfaces.IFileStorage#createDirectory
 * @param {String} path Storage path of the directory to create
 * @return {Promise} Resolved when created
 * @since 0.1.9
 */

/**
 * Delete a file
 *
 * @method gpf.interfaces.IFileStorage#deleteFile
 * @param {String} path Storage path to the file
 * @return {Promise} Resolved when deleted
 * @since 0.1.9
 */

/**
 * Delete a directory
 *
 * @method gpf.interfaces.IFileStorage#deleteDirectory
 * @param {String} path Storage path to the directory
 * @return {Promise} Resolved when deleted
 * @since 0.1.9
 */

_gpfDefineInterface("FileStorage", _gpfSyncReadSourceJSON("interfaces/filestorage.json"));

/*#ifndef(UMD)*/

// Generates an empty function to reflect the null complexity of this module
(function _gpfInterfacesFilestorage () {}());

/*#endif*/
