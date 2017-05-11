/**
 * @file HTTP helper
 */
/*#ifndef(UMD)*/
"use strict";
/*#endif*/

function _gpfHttpProcess (request) {

}

function _gpfProcessAlias (method, url) {
    if ("string" === typeof url) {
        return _gpfHttpProcess({
            method: method,
            url: url
        });
    }
    return _gpfHttpProcess(Object.assign({
        method: method
    }, url));
}

gpf.http = {

    /** @gpf:sameas _gpfHttpProcess */
    request: _gpfHttpProcess,

    get: _gpfProcessAlias.bind(gpf.http, "GET"),
    post: _gpfProcessAlias.bind(gpf.http, "POST")

};
