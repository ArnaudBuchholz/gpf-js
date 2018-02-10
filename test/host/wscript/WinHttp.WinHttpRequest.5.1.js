"use strict";

const syncRequest = require("sync-request");

class WinHttpRequest {

    constructor () {
        this._headers = {};
    }

    Open (method, url) {
        this._method = method;
        this._url = url;
    }

    setRequestHeader (name, value) {
        this._headers[name] = value;
    }

    Send (data) {
        this._response = syncRequest(this._method, this._url, {
            body: data,
            headers: this._headers
        });
    }

    get Status () {
        return this._response.statusCode;
    }

    GetAllResponseHeaders () {
        const headers = this._response.headers;
        return Object.keys(headers)
            .map(name => `${name}: ${headers[name]}`)
            .join("\r\n");
    }

    get ResponseText () {
        return this._response.body.toString();
    }

}

module.exports = WinHttpRequest;
