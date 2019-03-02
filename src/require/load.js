/**
 * @file Require resource loading implementation
 * @since 0.2.2
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfPathExtension*/ // Get the extension of the last name of a path (including dot)
/*global _gpfRead*/ // Generic read method
/*global _gpfIgnore*/
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

function _gpfLoadOrPreload (context, name) {
    var preload = context.preload[name];
    if (preload) {
        return Promise.resolve(preload);
    }
    return _gpfRead(name);
}

function _gpfLoadTextProcessor (name, content) {
    _gpfIgnore(name);
    return Promise.resolve(content);
}

function _gpfLoadGetProcessor (resource) {
    return _gpfRequireProcessor[resource.type] || _gpfLoadTextProcessor;
}

/**
 * Load the resource
 *
 * @param {String} name Resource name
 * @return {Promise<*>} Resolved with the resource result
 * @since 0.2.2
 */
function _gpfRequireLoad (name) {
    var me = this;
    return _gpfLoadOrPreload(me, name)
        .then(function (content) {
            return me.preprocess({
                name: name,
                content: content,
                type: _gpfPathExtension(name).toLowerCase()
            });
        })
        .then(function (resource) {
            return _gpfLoadGetProcessor(resource).call(me, resource.name, resource.content);
        });
}
