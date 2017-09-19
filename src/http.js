/**
 * @file HTTP helper
 * @since 0.2.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfHost*/ // Host type
/*exported _gpfHttpRequestImplByHost*/ // HTTP Request Implementation per host
/*#endif*/

/**
 * Http methods
 * @since 0.2.1
 */
var _HTTP_METHODS = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    OPTIONS: "OPTIONS",
    DELETE: "DELETE",
    HEAD: "HEAD"
};

/**
 * HTTP request settings
 *
 * @typedef gpf.typedef.httpRequestSettings
 * @property {gpf.http.methods} [method=gpf.http.methods.get] HTTP method
 * @property {String} url URL to submit the request to
 * @property {Object} [headers] Request headers
 * @property {String} [data] Request data, valid only for {@link gpf.http.methods.post} and {@link gpf.http.methods.put}
 *
 * @see gpf.http.request
 * @since 0.2.1
 */

/**
 * HTTP request response
 *
 * @typedef gpf.typedef.httpRequestResponse
 * @property {int} status HTTP status
 * @property {Object} headers HTTP response headers
 * @property {String} responseText Response Text
 *
 * @see gpf.http.request
 * @since 0.2.1
 */

/**
 * HTTP request host specific implementation per host
 *
 * @type {Object}
 * @since 0.2.1
 */
var _gpfHttpRequestImplByHost = {};

/**
 * HTTP request common implementation
 *
 * @param {gpf.typedef.httpRequestSettings} request HTTP Request settings
 * @return {Promise<gpf.typedef.httpRequestResponse>} Resolved on request completion
 * @since 0.2.1
 */
function _gpfHttpRequest (request) {
    return new Promise(function (resolve, reject) {
        _gpfHttpRequestImplByHost[_gpfHost](request, resolve, reject);
    });
}

/**
 * Implementation of aliases
 *
 * @param {String} method HTTP method to apply
 * @param {String|gpf.typedef.httpRequestSettings} url Url to send the request to or a request settings object
 * @param {*} [data] Data to be sent to the server
 * @return {Promise<gpf.typedef.httpRequestResponse>} HTTP request promise
 * @since 0.2.1
 */
function _gpfProcessAlias (method, url, data) {
    if ("string" === typeof url) {
        return _gpfHttpRequest({
            method: method,
            url: url,
            data: data
        });
    }
    return _gpfHttpRequest(Object.assign({
        method: method
    }, url));
}

/**
 * @namespace gpf.http
 * @description Root namespace for http specifics
 * @since 0.2.1
 */
gpf.http = {

    /**
     * HTTP methods enumeration
     *
     * @enum {String}
     * @readonly
     * @since 0.2.1
     */
    methods: {

        /**
         * GET
         * @since 0.2.1
         */
        get: _HTTP_METHODS.GET,

        /**
         * POST
         * @since 0.2.1
         */
        post: _HTTP_METHODS.POST,

        /**
         * PUT
         * @since 0.2.1
         */
        put: _HTTP_METHODS.PUT,

        /**
         * OPTIONS
         * @since 0.2.1
         */
        options: _HTTP_METHODS.OPTIONS,

        /**
         * DELETE
         * @since 0.2.1
         */
        "delete": _HTTP_METHODS.DELETE,

        /**
         * HEAD
         */
        head: _HTTP_METHODS.HEAD
    },

    /**
     * @gpf:sameas _gpfHttpRequest
     * @since 0.2.1
     */
    request: _gpfHttpRequest,

    /**
     * HTTP GET request
     *
     * @method
     * @param {String|gpf.typedef.httpRequestSettings} urlOrRequest URL or HTTP Request settings
     * @return {Promise<gpf.typedef.httpRequestResponse>} Resolved on request completion
     * @since 0.2.1
     */
    get: _gpfProcessAlias.bind(gpf.http, _HTTP_METHODS.GET),

    /**
     * HTTP POST request
     *
     * @method
     * @param {String|gpf.typedef.httpRequestSettings} urlOrRequest URL or HTTP Request settings
     * @param {String} data Data to POST
     * @return {Promise<gpf.typedef.httpRequestResponse>} Resolved on request completion
     * @since 0.2.1
     */
    post: _gpfProcessAlias.bind(gpf.http, _HTTP_METHODS.POST),

    /**
     * HTTP PUT request
     *
     * @method
     * @param {String|gpf.typedef.httpRequestSettings} urlOrRequest URL or HTTP Request settings
     * @param {String} data Data to PUT
     * @return {Promise<gpf.typedef.httpRequestResponse>} Resolved on request completion
     * @since 0.2.1
     */
    put: _gpfProcessAlias.bind(gpf.http, _HTTP_METHODS.PUT),

    /**
     * HTTP OPTIONS request
     *
     * @method
     * @param {String|gpf.typedef.httpRequestSettings} urlOrRequest URL or HTTP Request settings
     * @return {Promise<gpf.typedef.httpRequestResponse>} Resolved on request completion
     * @since 0.2.1
     */
    options: _gpfProcessAlias.bind(gpf.http, _HTTP_METHODS.OPTIONS),

    /**
     * HTTP DELETE request
     *
     * @method
     * @param {String|gpf.typedef.httpRequestSettings} urlOrRequest URL or HTTP Request settings
     * @return {Promise<gpf.typedef.httpRequestResponse>} Resolved on request completion
     * @since 0.2.1
     */
    "delete": _gpfProcessAlias.bind(gpf.http, _HTTP_METHODS.DELETE),

    /**
     * HTTP HEAD request
     *
     * @method
     * @param {String|gpf.typedef.httpRequestSettings} urlOrRequest URL or HTTP Request settings
     * @return {Promise<gpf.typedef.httpRequestResponse>} Resolved on request completion
     */
    head: _gpfProcessAlias.bind(gpf.http, _HTTP_METHODS.HEAD)

};
