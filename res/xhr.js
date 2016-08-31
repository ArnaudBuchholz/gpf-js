/**
 * Promise implementation of XmlHttpRequest
 */
(function () {
    "use strict";

    function _xhrSend (request, method, data) {
        return new Promise(function (resolve, reject) {
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
        },

        /**
         * GET
         *
         * @return {Promise} resolved with response text
         */
        get: function () {
            return _xhrSend(this, "GET");
        },

        /**
         * POST
         *
         * @param {*} request data
         * @return {Promise} resolved with response text
         */
        post: function (data) {
            return _xhrSend(this, "POST", data);
        }

    };

    window.xhr = function (url) {
        return new _XhrRequest(url);
    };

}());
