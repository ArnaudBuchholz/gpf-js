/**
 * Promise implementation of XmlHttpRequest
 */
(function () {
    "use strict";

    var READYSTATE_DONE = 4,
        HTTP_STATUS_CLASS_FACTOR = 100,
        HTTP_STATUS_CLASS_OK = 2;

    function noop () {}

    function xhrSucceeded (xhr) {
        return Math.floor(xhr.status / HTTP_STATUS_CLASS_FACTOR) === HTTP_STATUS_CLASS_OK;
    }

    function xhrSend (request, resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(request.method, request._url, !request._synchronous);
        Object.keys(request._headers).forEach(function (headerName) {
            xhr.setRequestHeader(headerName, request._headers[headerName]);
        });
        xhr.onreadystatechange = function () {
            if (xhr.readyState === READYSTATE_DONE) {
                if (xhrSucceeded(xhr)) {
                    resolve(xhr.responseText);
                } else {
                    reject(xhr.statusText);
                }
            }
        };
        xhr.send(request.data);
        return xhr;
    }

    function xhrExecute (request, method, data) {
        request.method = method;
        request.data = data;
        var result;
        if (request._synchronous) {
            result = xhrSend(request, noop, noop);
            result.then = function (callback) {
                callback(result.responseText);
            };
        } else {
            result = new Promise(function (resolve, reject) {
                xhrSend(request, resolve, reject);
            });
        }
        result.asJson = function () {
            return result.then(function (responseText) {
                return JSON.parse(responseText);
            });
        };
        return result;
    }

    /**
     * XHR request parameters handler
     *
     * @param {String} url URL to request
     * @param {Boolean} [synchronous=false] Synchronous request
     * @constructor
     * @private
     */
    function XhrRequest (url, synchronous) {
        this._url = url;
        if (synchronous === true) {
            this._synchronous = true;
        }
    }

    XhrRequest.prototype = {

        /** URL of the request */
        _url: "",

        /** Makes a synchronous request */
        _synchronous: false,

        /** Request headers */
        _headers: {},

        /**
         * Set request headers
         *
         * @param {Object} headerDictionary Dictionary of header properties
         * @gpf:chainable
         */
        headers: function (headerDictionary) {
            this._headers = headerDictionary;
            return this;
        }

    };

    var _methods = {
        get: false,
        options: false,
        post: true,
        put: true,
        "delete": false
    };

    Object.keys(_methods).forEach(function (methodName) {
        var isDataExpected = _methods[methodName],
            httpVerb = methodName.toUpperCase();
        if (isDataExpected) {
            XhrRequest.prototype[methodName] = function (data) {
                return xhrExecute(this, httpVerb, data);
            };
        } else {
            XhrRequest.prototype[methodName] = function () {
                return xhrExecute(this, httpVerb);
            };
        }
    });

    window.xhr = function (url, synchronous) {
        return new XhrRequest(url, synchronous);
    };

}());
