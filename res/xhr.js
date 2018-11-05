/**
 * Promise implementation of XmlHttpRequest
 */
(function () {
    "use strict";

    var READYSTATE_DONE = 4,
        HTTP_STATUS_CLASS_FACTOR = 100,
        HTTP_STATUS_CLASS_OK = 2;

    function xhrSend (request, method, data) {
        var result = new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, request._url);
            Object.keys(request._headers).forEach(function (headerName) {
                xhr.setRequestHeader(headerName, request._headers[headerName]);
            });
            xhr.onreadystatechange = function () {
                if (xhr.readyState === READYSTATE_DONE) {
                    if (Math.floor(xhr.status / HTTP_STATUS_CLASS_FACTOR) === HTTP_STATUS_CLASS_OK) {
                        resolve(xhr.responseText);
                    } else {
                        reject(xhr.statusText);
                    }
                }
            };
            xhr.send(data);
        });
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
     * @constructor
     * @private
     */
    function XhrRequest (url) {
        this._url = url;
    }

    XhrRequest.prototype = {

        /** URL of the request */
        _url: "",

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
                return xhrSend(this, httpVerb, data);
            };
        } else {
            XhrRequest.prototype[methodName] = function () {
                return xhrSend(this, httpVerb);
            };
        }
    });

    window.xhr = function (url) {
        return new XhrRequest(url);
    };

}());
