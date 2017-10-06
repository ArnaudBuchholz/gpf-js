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
/*global _gpfPathExtension*/
/*exported _gpfRequireLoad*/ // Load the resource
/*exported _gpfRequireProcessor*/ // Mapping of resource extension to processor function
/*#endif*/

var _gpfRequireLoadImpl;

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
    return fs.openTextStream(name, _GPF_FS_OPENFOR.READING)
        .then(function (iReadStream) {
            return iReadStream.read(iWritableStream);
        })
        .then(function () {
            return iWritableStream.toString();
        });
}

if (_gpfHost === _GPF_HOST.BROWSER || _gpfHost === _GPF_HOST.PHANTOM_JS) {
    _gpfRequireLoadImpl = _gpfRequireLoadHTTP;
} else {
    _gpfRequireLoadImpl = _gpfRequireLoadFS;
}

/**
 * Mapping of resource extension to processor function
 *
 * @type {Object}
 */
var _gpfRequireProcessor = {};

/**
 * Load the resource
 * @param {String} name Resource name
 * @return {Promise} Resolved with the resource
 */
function _gpfRequireLoad (name) {
    return _gpfRequireLoadImpl(name)
        .then(function (content) {
            var processor = _gpfRequireProcessor[_gpfPathExtension(name).toLowerCase()];
            if (processor) {
                return processor(name, content);
            }
            // Treated as simple text file by default
            return content;
        });
}

