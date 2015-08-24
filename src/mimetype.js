/*#ifndef(UMD)*/
"use strict";
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*#endif*/

var
    /**
     * Dictionary used to generate _gpfMimeTypesFromExtension and _gpfMimeTypesToExtension
     *
     * @type {Object}
     */
    _gpfHardCodedMimeTypes = {
        application: {
            javascript: "js"
        },
        image: {
            gif: 0,
            jpeg: "jpg,jpeg",
            png: 0
        },
        text: {
            css: 0,
            html: "htm,html",
            plain: "txt,text,log"
        }
    },

    /**
     * Dictionary of mime type to extension
     *
     * @type {Object}
     */
    _gpfMimeTypesToExtension = null,

    /**
     * Dictionary of extension to mime type
     *
     * @type {Object}
     */
    _gpfMimeTypesFromExtension = null;

function _createMimeTypeExtensionMapping (mimeType, fileExtension) {
    _gpfMimeTypesFromExtension[fileExtension] = mimeType;
    if (undefined === _gpfMimeTypesToExtension[mimeType]) {
        _gpfMimeTypesToExtension[mimeType] = fileExtension;
    }
}

/**
 * Recursive function that fills _gpfMimeTypesToExtension & _gpfMimeTypesFromExtension
 *
 * @param {String} path
 * @param {Object} mappings
 * @private
 */
function _gpfBuildMimeTypeFromMappings (path, mappings) {
    _gpfObjectForEach(mappings, function (extensions, key) {
        var mimeType = path + key;
        if (0 === extensions) {
            _createMimeTypeExtensionMapping(mimeType, "." + key);

        } else if ("string" === typeof extensions) {
            extensions.split(",").forEach(function (extension) {
                _createMimeTypeExtensionMapping(mimeType, "." + extension);
            });

        } else { // Assuming extensions is an object
            _gpfBuildMimeTypeFromMappings(mimeType + "/", extensions);
        }
    });
}

/**
 * Retrieve the mime type associates with the file extension (default is "application/octet-stream")
 *
 * @param {String} fileExtension
 * @return {String}
 */
function _gpfGetMimeType (fileExtension) {
    var mimeType = _gpfMimeTypesFromExtension[fileExtension.toLowerCase()];
    if (undefined === mimeType) {
        // Default
        mimeType = "application/octet-stream";
    }
    return mimeType;
}

/**
 * Retrieve the file extension associated with the mime type (default is ".bin")
 *
 * @param {String} mimeType
 * @return {String}
 */
function _gpfGetFileExtension (mimeType) {
    var fileExtension = _gpfMimeTypesToExtension[mimeType.toLowerCase()];
    if (undefined === fileExtension) {
        // Default
        fileExtension = ".bin";
    }
    return fileExtension;
}

/**
 * Initialize _gpfMimeTypesFromExtension and _gpfMimeTypesToExtension
 *
 * @param {Function} callback
 * @param {Array] parameters
 * @private
 */
function _gpfInitMimeTypes (callback, parameters) {
    _gpfMimeTypesFromExtension = {};
    _gpfMimeTypesToExtension = {};
    _gpfBuildMimeTypeFromMappings("", _gpfHardCodedMimeTypes);
    gpf.web.getMimeType = _gpfGetMimeType;
    gpf.web.getFileExtension = _gpfGetFileExtension;
    return callback.apply(gpf.web, parameters);
}

// @inheritdoc _gpfGetMimeType
gpf.web.getMimeType = function () {
    return _gpfInitMimeTypes(_gpfGetMimeType, arguments);
};

// @inheritdoc _gpfGetFileExtension
gpf.web.getFileExtension = function () {
    return _gpfInitMimeTypes(_gpfGetFileExtension, arguments);
};
