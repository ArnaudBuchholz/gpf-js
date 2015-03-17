/*#ifndef(UMD)*/
"use strict";
/*#endif*/

var
    /**
     * Object used to generate _gpfMimeTypesFromExtension and
     * _gpfMimeTypesToExtension
     *
     * @type {Object}
     * @private
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
     * @private
     */
    _gpfMimeTypesToExtension = null,

    /**
     * Dictionary of extension to mime type
     *
     * @type {Object}
     * @private
     */
    _gpfMimeTypesFromExtension = null,

    _gpfBuildMimeTypeFromMappings = function (path, mappings) {
        var
            key,
            mimeType,
            fileExtension,
            extensions,
            len,
            idx;
        for (key in mappings) {
            if (mappings.hasOwnProperty(key)) {
                if (path) {
                    mimeType = path + "/" + key;
                } else {
                    mimeType = key;
                }
                extensions = mappings[key];
                if (0 === extensions) {
                    fileExtension = "." + key;
                    _gpfMimeTypesFromExtension[fileExtension] = mimeType;
                    if (undefined === _gpfMimeTypesToExtension[mimeType]) {
                        _gpfMimeTypesToExtension[mimeType] = fileExtension;
                    }
                } else if ("string" === typeof extensions) {
                    extensions = extensions.split(",");
                    len = extensions.length;
                    for (idx = 0; idx < len; ++idx) {
                        fileExtension = "." + extensions[idx];
                        _gpfMimeTypesFromExtension[fileExtension] = mimeType;
                        if (undefined === _gpfMimeTypesToExtension[mimeType]) {
                            _gpfMimeTypesToExtension[mimeType] = fileExtension;
                        }
                    }
                } else { // Assuming extensions is an object
                    _gpfBuildMimeTypeFromMappings(mimeType, extensions);
                }
            }
        }
    },

    /**
     * Initialize _gpfMimeTypesFromExtension and _gpfMimeTypesToExtension
     *
     * @private
     */
    _gpfInitMimeTypes = function () {
        if (null === _gpfMimeTypesFromExtension) {
            _gpfMimeTypesFromExtension = {};
            _gpfMimeTypesToExtension = {};
            _gpfBuildMimeTypeFromMappings("", _gpfHardCodedMimeTypes);
        }
    };


/**
 * Retrieve the mime type associates with the file extension (default is
 * "application/octet-stream")
 *
 * @param {String} fileExtension
 * @return {String}
 */
gpf.web.getMimeType = function (fileExtension) {
    var mimeType;
    _gpfInitMimeTypes();
    mimeType = _gpfMimeTypesFromExtension[fileExtension.toLowerCase()];
    if (undefined === mimeType) {
        // Default
        mimeType = "application/octet-stream";
    }
    return mimeType;
};

/**
 * Retrieve the file extension associated with the mime type (default is ".bin")
 *
 * @param {String} mimeType
 * @return {String}
 */
gpf.web.getFileExtension = function (mimeType) {
    var fileExtension;
    _gpfInitMimeTypes();
    fileExtension = _gpfMimeTypesToExtension[mimeType.toLowerCase()];
    if (undefined === fileExtension) {
        // Default
        fileExtension = ".bin";
    }
    return fileExtension;
};