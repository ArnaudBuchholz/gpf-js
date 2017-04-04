/**
 * @file IFileStorage interface
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
 */

/**
 * File Storage interface, defines base methods to access any kind of file storage
 *
 * @interface gpf.interfaces.IFileStorage
 */

/**
 * Get information on the storage path
 *
 * @method gpf.interfaces.IFileStorage#getInfo
 * @param {String} path Storage path to get info from
 * @return {Promise<gpf.typedef.fileStorageInfo>} information
 */

/**
 * Open storage path content as a text stream
 *
 * @method gpf.interfaces.IFileStorage#openTextStream
 * @param {String} path Storage path to open stream on
 * @param {gpf.fs.openFor} mode Switch between reading and appending
 * @return {Promise<gpf.interfaces.IReadableStream|gpf.interfaces.IWritableStream>} Stream to the file
 */

/**
 * Close the underlying file: the stream becomes unusable
 *
 * @method gpf.interfaces.IFileStorage#close
 * @param {gpf.interfaces.IReadableStream|gpf.interfaces.IWritableStream} stream Stream to close
 * @return {Promise} Resolved when closed
 */

/**
 * Provide information on the content of a directory through an IEnumerator
 *
 * @method gpf.interfaces.IFileStorage#explore
 * @param {String} path Storage path to a directory to explore
 * @return {Promise<gpf.interfaces.IEnumerator<gpf.typedef.fileStorageInfo>>} Enumerator interface to get directory
 * content names
 */

/**
 * Create a directory
 *
 * @method gpf.interfaces.IFileStorage#createDirectory
 * @param {String} path Storage path of the directory to create
 * @return {Promise} Resolved when created
 */

/**
 * Delete a file
 *
 * @method gpf.interfaces.IFileStorage#deleteFile
 * @param {String} path Storage path to the file
 * @return {Promise} Resolved when deleted
 */

/**
 * Delete a directory
 *
 * @method gpf.interfaces.IFileStorage#deleteDirectory
 * @param {String} path Storage path to the directory
 * @return {Promise} Resolved when deleted
 */

_gpfDefineInterface("FileStorage", _gpfSyncReadSourceJSON("interfaces/filestorage.json"));
