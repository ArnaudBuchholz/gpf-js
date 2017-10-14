/**
 * @file Require resource loading implementation
 * @since 0.2.2
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _GPF_HTTP_METHODS*/ // HTTP Methods
/*global _gpfFsRead*/ // Generic read method
/*global _gpfHost*/ // Host type
/*global _gpfHttpRequest*/ // HTTP request common implementation
/*global _gpfPathExtension*/ // Get the extension of the last name of a path (including dot)
/*exported _gpfRequireLoad*/ // Load the resource
/*exported _gpfRequireProcessor*/ // Mapping of resource extension to processor function
/*#endif*/

/* this is globally used as the current context in this module */
/*jshint -W040*/
/*eslint-disable no-invalid-this*/

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
    if (name.charAt(0) === "/") {
        // Must be relative to the current execution path
        name = "." + name;
    }
    return _gpfFsRead(name);
}

if (_gpfHost === _GPF_HOST.BROWSER) {
    _gpfRequireLoadImpl = _gpfRequireLoadHTTP;
} else {
    _gpfRequireLoadImpl = _gpfRequireLoadFS;
}

/**
 * Mapping of resource extension to processor function
 *
 * @type {Object}
 * @since 0.2.2
 */
var _gpfRequireProcessor = {};

/**
 * Load the resource
 *
 * @param {String} name Resource name
 * @return {Promise<*>} Resolved with the resource result
 * @since 0.2.2
 */
function _gpfRequireLoad (name) {
    var me = this;
    return _gpfRequireLoadImpl(name)
        .then(function (content) {
            var processor = _gpfRequireProcessor[_gpfPathExtension(name).toLowerCase()];
            if (processor) {
                return processor.call(me, name, content);
            }
            // Treated as simple text file by default
            return content;
        });
}

