/**
 * @file Require resource loading implementation
 * @since 0.2.2
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfPathExtension*/ // Get the extension of the last name of a path (including dot)
/*global _gpfRead*/ // Generic read method
/*exported _gpfRequireLoad*/ // Load the resource
/*exported _gpfRequireProcessor*/ // Mapping of resource extension to processor function
/*#endif*/

/* this is globally used as the current context in this module */
/*jshint -W040*/
/*eslint-disable no-invalid-this*/

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
    return _gpfRead(name)
        .then(function (content) {
            var processor = _gpfRequireProcessor[_gpfPathExtension(name).toLowerCase()];
            if (processor) {
                return processor.call(me, name, content);
            }
            // Treated as simple text file by default
            return content;
        });
}
