/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefIntrf*/ // gpf.define for interfaces
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*#endif*/

/**
 * File Storage interface, defines base methods to access any kind of file
 * storage.
 *
 * @class gpf.interfaces.IFileStorage
 * @extends gpf.interfaces.Interface
 */
_gpfDefIntrf("IFileStorage", {

    /**
     * Get information on the provided path
     *
     * @param {String} path
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event gpf.events.EVENT_READY
     * @eventParam {Object} info contains:
     * - {Number} type see _GPF_FS_TYPE_xxx
     * - {String} fileName file name only
     * - {String} filePath full path to the file
     * - {Number} size
     * - {Date} createdDateTime
     * - {Date} modifiedDateTime
     */
    "[getInfo]": [gpf.$ClassEventHandler()],
    getInfo: function (path, eventsHandler) {
        _gpfIgnore(path);
        _gpfIgnore(eventsHandler);
    },

    /**
     * Read path content as a binary stream
     *
     * @param {String} path
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event gpf.events.EVENT_READY
     * @eventParam {gpf.interface.IReadableStream} stream
     */
    "[readAsBinaryStream]": [gpf.$ClassEventHandler()],
    readAsBinaryStream: function (path, eventsHandler) {
        _gpfIgnore(path);
        _gpfIgnore(eventsHandler);
    },

    /**
     * Write path content as a binary stream (overwrite content if it exists)
     *
     * @param {String} path
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event gpf.events.EVENT_READY
     * @eventParam {gpf.interface.IWritableStream} stream
     */
    "[writeAsBinaryStream]": [gpf.$ClassEventHandler()],
    writeAsBinaryStream: function (path, eventsHandler) {
        _gpfIgnore(path);
        _gpfIgnore(eventsHandler);
    },

    /**
     * Close the underlying file: the stream becomes unusable
     *
     * @param {gpf.interfaces.IReadableStream|
     * gpf.interfaces.IWritableStream} stream
     */
    close: function (stream) {
        _gpfIgnore(stream);
    },

    /**
     * Provide information on the content of a folder using an IEnumerator
     *
     * @param {String} path
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event gpf.events.EVENT_READY
     * @eventParam {gpf.interface.IEnumerator} enumerator
     * Each enumerated item is like the info result of getInfo
     */
    "[explore]": [gpf.$ClassEventHandler()],
    explore: function (path, eventsHandler) {
        _gpfIgnore(path);
        _gpfIgnore(eventsHandler);
    },

    /**
     * Creates the folder
     *
     * @param {String} path
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event gpf.events.EVENT_READY
     */
    "[createFolder]": [gpf.$ClassEventHandler()],
    createFolder: function (path, eventsHandler) {
        _gpfIgnore(path);
        _gpfIgnore(eventsHandler);
    },

    /**
     * Deletes the file
     *
     * @param {String} path
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event gpf.events.EVENT_READY
     */
    "[deleteFile]": [gpf.$ClassEventHandler()],
    deleteFile: function (path, eventsHandler) {
        _gpfIgnore(path);
        _gpfIgnore(eventsHandler);
    },

    /**
     * Deletes the folder
     *
     * @param {String} path
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event gpf.events.EVENT_READY
     */
    "[deleteFolder]": [gpf.$ClassEventHandler()],
    deleteFolder: function (path, eventsHandler) {
        _gpfIgnore(path);
        _gpfIgnore(eventsHandler);
    }

});