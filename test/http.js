"use strict";

describe("http", function () {

    var baseUrl = "http://localhost:" + config.httpPort + "/";

    describe("gpf.http", function () {

        it("allows the GET operation", function (done) {
            gpf.http.request({
                method: gpf.http.get,
                url: baseUrl + "echo?status=200&content=Hello%20World"

            }).then(function (response) {
                assert(response.statusCode === 200);
                assert(response.textContent === "Hello World");
                done();
            }, done);
        });

        it("supports common shortcuts", function (done) {
            gpf.http.get(baseUrl + "echo?status=200&content=Hello%20World").then(function (response) {
                assert(response.statusCode === 200);
                assert(response.textContent === "Hello World");
                done();
            }, done);
        });

    });

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

});
