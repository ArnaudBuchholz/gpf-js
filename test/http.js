"use strict";

describe("http", function () {

    it("knows config.httpPort", function () {
        assert("object" === typeof config && "number" === typeof config.httpPort);
    });

    describe("gpf.http", function () {

        var baseUrl;

        before(function () {
            baseUrl = "http://localhost:" + config.httpPort + "/echo/?";
        });

        it("allows the GET operation", function (done) {
            gpf.http.request({
                method: gpf.http.methods.get,
                url: baseUrl + "status=200&content=Hello%20World"

            }).then(function (response) {
                assert(response.status === 200);
                assert(response.responseText === "Hello World");
                done();
            })["catch"](done);
        });

        it("offers the GET shortcut", function (done) {
            gpf.http.get(baseUrl + "status=200&content=Hello%20World").then(function (response) {
                assert(response.status === 200);
                assert(response.responseText === "Hello World");
                done();
            })["catch"](done);
        });

        it("succeeds when the HTTP request fails", function (done) {
            gpf.http.get(baseUrl + "status=500").then(function (response) {
                assert(response.status === 500);
                done();
            })["catch"](done);
        });

        it("gives access to response headers", function (done) {
            gpf.http.request({
                method: gpf.http.methods.get,
                url: baseUrl + "status=200&headers={\"x-test-1\":\"OK\",\"x-test-2\":123}"

            }).then(function (response) {
                assert(response.status === 200);
                assert(response.headers["x-test-1"] === "OK");
                assert(response.headers["x-test-2"] === "123");
                done();
            })["catch"](done);
        });

    });

/*
    describe("gpf.http.mock", function () {

        it("mocks any request", function (done) {
            gpf.http.mock({
                method: gpf.http.get,
                url: /echo\?status=([0-9]+)/,
                response: function (request) {
                    return Promise.resolve({
                        textContent: ""
                    });
                }
            })
        });
    });
 */

});
