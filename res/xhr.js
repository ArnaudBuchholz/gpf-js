/**
 * Promise implementation of XmlHttpRequest
 */
(function () {
    "use strict";

    function _xhrSend (request, method, data) {
        var result = new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, request._url);
            Object.keys(request._headers).forEach(function (headerName) {
                xhr.setRequestHeader(headerName, request._headers[headerName]);
            });
            xhr.onreadystatechange = function () {
                if (4 === xhr.readyState) {
                    if (2 === Math.floor(xhr.status / 100)) {
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
     * @param {String} url
     * @private
     */
    function _XhrRequest (url) {
        /*jshint validthis:true*/
        this._url = url;
    }

    _XhrRequest.prototype = {

        // @property {String} URL of the request
        _url: "",

        // @property {Object} Request headers
        _headers: {},

        /**
         * Set request headers
         *
         * @param {Object} headerDictionary
         * @return {_XhrRequest} allows chaining
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
        put: true
    };

    Object.keys(_methods).forEach(function (methodName) {
        var isDataExpected = _methods[methodName],
            httpVerb = methodName.toUpperCase();
        if (isDataExpected) {
            _XhrRequest.prototype[methodName] = function (data) {
                return _xhrSend(this, httpVerb, data);
            };
        } else {
            _XhrRequest.prototype[methodName] = function () {
                return _xhrSend(this, httpVerb);
            };
        }
    });

    window.xhr = function (url) {
        return new _XhrRequest(url);
    };

}());
