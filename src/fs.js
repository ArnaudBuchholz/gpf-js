/*#ifndef(UMD)*/
"use strict";
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _GPF_FS_TYPE_NOT_FOUND*/ // _GPF_FS_TYPE_NOT_FOUND
/*global _GPF_FS_TYPE_FILE*/ // _GPF_FS_TYPE_FILE
/*global _GPF_FS_TYPE_DIRECTORY*/ // _GPF_FS_TYPE_DIRECTORY
/*global _GPF_FS_TYPE_UNKNOWN*/ // _GPF_FS_TYPE_UNKNOWN
/*global _gpfSetReadOnlyProperty*/ // gpf.setReadOnlyProperty
/*#endif*/

gpf.fs = {

    /**
     * Get information on the provided file path
     *
     * @param {*} path
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event gpf.events.EVENT_READY
     * @eventParam {Object} info contains:
     * - type {Number} see _GPF_FS_TYPE_xxx
     * - size {Number}
     * - createdDateTime
     * - modifiedDateTime
     */
    getInfo: function (path, eventsHandler) {
        _gpfIgnore(path);
        _gpfIgnore(eventsHandler);
        throw gpf.Error.Abstract();
    },

    /**
     * Read as a binary stream
     *
     * @param {*} path
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event gpf.events.EVENT_READY
     * @eventParam {gpf.interface.IReadableStream} stream
     */
    readAsBinaryStream: function (path, eventsHandler) {
        _gpfIgnore(path);
        _gpfIgnore(eventsHandler);
        throw gpf.Error.Abstract();
    },

    /**
     * Write as a binary stream (overwrite file if it exists)
     *
     * @param {*} path
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event gpf.events.EVENT_READY
     * @eventParam {gpf.interface.IWritableStream} stream
     */
    writeAsBinaryStream: function (path, eventsHandler) {
        _gpfIgnore(path);
        _gpfIgnore(eventsHandler);
        throw gpf.Error.Abstract();
    },

    /**
     * Close the underlying file: the stream becomes unusable
     *
     * @param {gpf.interfaces.IReadableStream|
     * gpf.interfaces.IWritableStream} stream
     */
    close: function (stream) {
        _gpfIgnore(stream);
        throw gpf.Error.Abstract();
    }

};

// Create file system constants
(function () {
    var gpfFs = gpf.fs,
        mappings = {
            TYPE_NOT_FOUND: _GPF_FS_TYPE_NOT_FOUND,
            TYPE_FILE: _GPF_FS_TYPE_FILE,
            TYPE_DIRECTORY: _GPF_FS_TYPE_DIRECTORY,
            TYPE_UNKNOWN: _GPF_FS_TYPE_UNKNOWN
        },
        key;
    for (key in mappings) {
        if (mappings.hasOwnProperty(key)) {
            _gpfSetReadOnlyProperty(gpfFs, key, mappings[key]);
        }
    }

}());