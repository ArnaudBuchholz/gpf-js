/**
 * @file HTTP helper
 * @since 0.2.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HTTP_METHODS*/ // HTTP Methods
/*global _gpfHost*/ // Host type
/*global _gpfHttpMockCheck*/ // Check if the provided request match any of the mocked one
/*exported _gpfHttpRequest*/ // HTTP request common implementation
/*exported _gpfHttpSetRequestImplIf*/ // Set the request implementation if the host matches
/*#endif*/

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
var _gpfHttpRequestImpl = {};

/**
 * Set the request implementation if the host matches
 *
 * @param {String} host host to test, if matching with the current one, an instance of the FileStorageClass is created
 * @param {Function} httpRequestImpl http request implementation function
 * @since 0.2.6
 */
function _gpfHttpSetRequestImplIf (host, httpRequestImpl) {
    if (host === _gpfHost) {
        _gpfHttpRequestImpl = httpRequestImpl;
    }
}

/**
 * HTTP request common implementation
 *
 * @param {gpf.typedef.httpRequestSettings} request HTTP Request settings
 * @return {Promise<gpf.typedef.httpRequestResponse>} Resolved on request completion
 * @since 0.2.1
 */
function _gpfHttpRequest (request) {
    return _gpfHttpMockCheck(request) || new Promise(function (resolve, reject) {
        _gpfHttpRequestImpl(request, resolve, reject);
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

Object.assign(gpf.http, /** @lends gpf.http */ {

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
        get: _GPF_HTTP_METHODS.GET,

        /**
         * POST
         * @since 0.2.1
         */
        post: _GPF_HTTP_METHODS.POST,

        /**
         * PUT
         * @since 0.2.1
         */
        put: _GPF_HTTP_METHODS.PUT,

        /**
         * OPTIONS
         * @since 0.2.1
         */
        options: _GPF_HTTP_METHODS.OPTIONS,

        /**
         * DELETE
         * @since 0.2.1
         */
        "delete": _GPF_HTTP_METHODS.DELETE,

        /**
         * HEAD
         * @since 0.2.2
         */
        head: _GPF_HTTP_METHODS.HEAD
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
    get: _gpfProcessAlias.bind(gpf.http, _GPF_HTTP_METHODS.GET),

    /**
     * HTTP POST request
     *
     * @method
     * @param {String|gpf.typedef.httpRequestSettings} urlOrRequest URL or HTTP Request settings
     * @param {String} data Data to POST
     * @return {Promise<gpf.typedef.httpRequestResponse>} Resolved on request completion
     * @since 0.2.1
     */
    post: _gpfProcessAlias.bind(gpf.http, _GPF_HTTP_METHODS.POST),

    /**
     * HTTP PUT request
     *
     * @method
     * @param {String|gpf.typedef.httpRequestSettings} urlOrRequest URL or HTTP Request settings
     * @param {String} data Data to PUT
     * @return {Promise<gpf.typedef.httpRequestResponse>} Resolved on request completion
     * @since 0.2.1
     */
    put: _gpfProcessAlias.bind(gpf.http, _GPF_HTTP_METHODS.PUT),

    /**
     * HTTP OPTIONS request
     *
     * @method
     * @param {String|gpf.typedef.httpRequestSettings} urlOrRequest URL or HTTP Request settings
     * @return {Promise<gpf.typedef.httpRequestResponse>} Resolved on request completion
     * @since 0.2.1
     */
    options: _gpfProcessAlias.bind(gpf.http, _GPF_HTTP_METHODS.OPTIONS),

    /**
     * HTTP DELETE request
     *
     * @method
     * @param {String|gpf.typedef.httpRequestSettings} urlOrRequest URL or HTTP Request settings
     * @return {Promise<gpf.typedef.httpRequestResponse>} Resolved on request completion
     * @since 0.2.1
     */
    "delete": _gpfProcessAlias.bind(gpf.http, _GPF_HTTP_METHODS.DELETE),

    /**
     * HTTP HEAD request
     *
     * @method
     * @param {String|gpf.typedef.httpRequestSettings} urlOrRequest URL or HTTP Request settings
     * @return {Promise<gpf.typedef.httpRequestResponse>} Resolved on request completion
     * @since 0.2.2
     */
    head: _gpfProcessAlias.bind(gpf.http, _GPF_HTTP_METHODS.HEAD)

});
