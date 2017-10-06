/**
 * @file Require resource loading implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_FS_OPENFOR*/ // File system stream opening mode
/*global _GPF_HOST*/ // Host types
/*global _GPF_HTTP_METHODS*/ // HTTP Methods
/*global _GpfStreamWritableString*/ // gpf.stream.WritableString
/*global _gpfFileStorageByHost*/ // gpf.interfaces.IFileStorage per host
/*global _gpfHost*/ // Host type
/*global _gpfHttpRequest*/ // HTTP request common implementation
/*exported _gpfRequireLoad*/ // Load the resource
/*#endif*/

/**
 * Load the resource
 * @param {String} name Resource name
 * @return {Promise} Resolved with the resource
 */
var _gpfRequireLoad;

function _gpfRequireLoadHTTP (name) {
    return _gpfHttpRequest({
        method: _GPF_HTTP_METHODS.GET,
        url: name
    }).then(function (response) {
        return response.responseText;
    });
}

function _gpfRequireLoadFS (name) {
    var fs = _gpfFileStorageByHost[_gpfHost],
        iWritableStream = new _GpfStreamWritableString();
    return fs.fs.openTextStream(name, _GPF_FS_OPENFOR.READING)
        .then(function (iReadStream) {
            return iReadStream.read(iWritableStream);
        })
        .then(function () {
            return iWritableStream.toString();
        });
}

if (_gpfHost === _GPF_HOST.BROWSER || _gpfHost === _GPF_HOST.PHANTOM_JS) {
    _gpfRequireLoad = _gpfRequireLoadHTTP;
} else {
    _gpfRequireLoad = _gpfRequireLoadFS;
}
