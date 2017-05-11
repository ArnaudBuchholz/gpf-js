/**
 * @file HTTP helper
 */
/*#ifndef(UMD)*/
"use strict";
/*#endif*/

/** Http methods */
var _HTTP_METHODS = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    OPTIONS: "OPTIONS",
    DELETE: "DELETE"
};

/**
 * HTTP request settings
 *
 * @typedef gpf.typedef.httpRequestSettings
 * @property {gpf.http.methods} method HTTP method
 *
 * @see gpf.http.request
 */

/**
 * HTTP request response
 *
 * @typedef gpf.typedef.httpRequestResponse
 * @property {gpf.http.methods} method HTTP method
 *
 * @see gpf.http.request
 */

/**
 *
 * @param {gpf.typedef.httpRequestSettings} request HTTP Request settings
 * @return {Promise} Resolved on request completion
 */
function _gpfHttpRequest (request) {

}

/**
 * Implementation of aliases
 *
 * @param {String} method HTTP method to apply
 * @param {String|gpf.typedef.httpRequestSettings} url Url to send the request to or a request settings object
 * @param {*} [data] Data to be sent to the server
 * @return {Promise}
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

gpf.http = {

    /**
     * HTTP methods enumeration
     *
     * @enum {String}
     * @readonly
     */
    methods: {

        /** GET */
        get: _HTTP_METHODS.GET,

        /** POST */
        post: _HTTP_METHODS.POST,

        /** PUT */
        put: _HTTP_METHODS.PUT,

        /** OPTIONS */
        options: _HTTP_METHODS.OPTIONS,

        /** PUT */
        "delete": _HTTP_METHODS.DELETE
    },

    /** @gpf:sameas _gpfHttpRequest */
    request: _gpfHttpRequest,

    get: _gpfProcessAlias.bind(gpf.http, _HTTP_METHODS.GET),
    post: _gpfProcessAlias.bind(gpf.http, _HTTP_METHODS.POST),
    put: _gpfProcessAlias.bind(gpf.http, _HTTP_METHODS.PUT),
    options: _gpfProcessAlias.bind(gpf.http, _HTTP_METHODS.OPTIONS),
    "delete": _gpfProcessAlias.bind(gpf.http, _HTTP_METHODS.DELETE)

};
