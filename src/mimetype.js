/*#ifndef(UMD)*/
"use strict";
/*global _gpfGetBootstrapMethod*/ // Create a method that contains a bootstrap (called only once)
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
// /*#endif*/

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
    /*gpf:inline(object)*/ _gpfObjectForEach(mappings, function (extensions, key) {
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
function _gpfInitMimeTypes (name, handler) {
    if (null === _gpfMimeTypesFromExtension) {
        _gpfMimeTypesFromExtension = {};
        _gpfMimeTypesToExtension = {};
        _gpfBuildMimeTypeFromMappings("", _gpfHardCodedMimeTypes);
    }
}

// @inheritdoc _gpfGetMimeType
_gpfGetBootstrapMethod("gpf.web.getMimeType", _gpfInitMimeTypes, _gpfGetMimeType);

// @inheritdoc _gpfGetFileExtension
_gpfGetBootstrapMethod("gpf.web.getFileExtension", _gpfInitMimeTypes, _gpfGetFileExtension);
