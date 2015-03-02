/*#ifndef(UMD)*/
"use strict";
/*#endif*/

var
    /**
     * Object used to generate _mimeTypesFromExtension and
     * _mimeTypesToExtension
     *
     * @type {Object}
     * @private
     */
    _hardCodedMimeTypes = {
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
    _mimeTypesToExtension = null,

    /**
     * Dictionary of extension to mime type
     *
     * @type {Object}
     * @private
     */
    _mimeTypesFromExtension = null,

    _buildMimeTypeFromMappings = function (path, mappings) {
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
                    _mimeTypesFromExtension[fileExtension] = mimeType;
                    if (undefined === _mimeTypesToExtension[mimeType]) {
                        _mimeTypesToExtension[mimeType] = fileExtension;
                    }
                } else if ("string" === typeof extensions) {
                    extensions = extensions.split(",");
                    len = extensions.length;
                    for (idx = 0; idx < len; ++idx) {
                        fileExtension = "." + extensions[idx];
                        _mimeTypesFromExtension[fileExtension] = mimeType;
                        if (undefined === _mimeTypesToExtension[mimeType]) {
                            _mimeTypesToExtension[mimeType] = fileExtension;
                        }
                    }
                } else { // Assuming extensions is an object
                    _buildMimeTypeFromMappings(mimeType, extensions);
                }
            }
        }
    },

    /**
     * Initialize _mimeTypesFromExtension and _mimeTypesToExtension
     *
     * @private
     */
    _initMimeTypes = function () {
        if (null === _mimeTypesFromExtension) {
            _mimeTypesFromExtension = {};
            _mimeTypesToExtension = {};
            _buildMimeTypeFromMappings("", _hardCodedMimeTypes);
        }
    };


/**
 * Retrieve the mime type associates with the file extension (default is
 * "application/octet-stream")
 *
 * @param {String} fileExtension
 * @return {String}
 */
gpf.http.getMimeType = function (fileExtension) {
    var mimeType;
    _initMimeTypes();
    mimeType = _mimeTypesFromExtension[fileExtension.toLowerCase()];
    if (undefined === mimeType) {
        // Default
        mimeType = "application/octet-stream";
    }
    return mimeType;
};

/**
 * Retrieve the file extension associated with the mime type (default is
 * ".bin")
 *
 * @param {String} mimeType
 * @return {String}
 */
gpf.http.getFileExtension = function (mimeType) {
    var fileExtension;
    _initMimeTypes();
    fileExtension = _mimeTypesToExtension[mimeType.toLowerCase()];
    if (undefined === fileExtension) {
        // Default
        fileExtension = ".bin";
    }
    return fileExtension;
};