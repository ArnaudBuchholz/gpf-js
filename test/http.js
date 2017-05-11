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
                method: gpf.http.get,
                url: baseUrl + "status=200&content=Hello%20World"

            }).then(function (response) {
                assert(response.statusCode === 200);
                assert(response.textContent === "Hello World");
                done();
            }, done);
        });

        it("supports common shortcuts", function (done) {
            gpf.http.get(baseUrl + "status=200&content=Hello%20World").then(function (response) {
                assert(response.statusCode === 200);
                assert(JSON.parsresponse.responseText === "Hello World");
                done();
            }, done);
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
