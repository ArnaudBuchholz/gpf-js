"use strict";

describe("gpf.http.mock", function () {

    var baseUrl;

    before(function () {
        baseUrl = "http://localhost:" + config.httpPort + "/echo/";
    });

    it("exposes a method to mock requests", function () {
        assert(typeof gpf.http.mock === "function");
    });

    it("exposes a method to remove one specific mocking", function () {
        assert(typeof gpf.http.mock.remove === "function");
    });

    it("exposes a method to reset all mocking", function () {
        assert(typeof gpf.http.mock.reset === "function");
    });

    describe("Simple mocking example", function () {

        var mockId;

        beforeEach(function () {
            mockId = gpf.http.mock({
                method: gpf.http.methods.get,
                url: /echo\/\?status=([0-9]+)/,
                response: function (request, status) {
                    if (status === "400") {
                        return; // Don't mock
                    }
                    return {
                        status: parseInt(status, 10) + 1,
                        headers: {
                            "x-mock": true
                        },
                        responseText: "It works"
                    };
                }
            });
        });

        afterEach(function () {
            if (mockId) {
                gpf.http.mock.remove(mockId);
            }
        });

        it("matches request URL and method", function (done) {
            gpf.http.get(baseUrl + "?status=200").then(function (response) {
                assert(response.status === 201);
                assert(response.headers["x-mock"] === true);
                assert(response.responseText === "It works");
                done();
            })["catch"](done);
        });

        if (config.httpPort === 0 || config.performance) {
            return;
        }

        it("matches request URL and method (non matching URL)", function (done) {
            gpf.http.get(baseUrl).then(function (response) {
                assert(response.status === 200);
                assert(response.headers["x-mock"] === undefined);
                done();
            })["catch"](done);
        });

        it("matches request URL and method (non matching method)", function (done) {
            gpf.http.put(baseUrl, "?status=200").then(function (response) {
                assert(response.status === 200);
                assert(response.headers["x-mock"] === undefined);
                done();
            })["catch"](done);
        });

        it("may decide to not mock", function (done) {
            gpf.http.get(baseUrl + "?status=400").then(function (response) {
                assert(response.status === 400);
                assert(response.headers["x-mock"] === undefined);
                done();
            })["catch"](done);
        });

        it("does not mock once removed", function (done) {
            gpf.http.mock.remove(mockId);
            mockId = undefined;
            gpf.http.get(baseUrl + "?status=200").then(function (response) {
                assert(response.status === 200);
                assert(response.headers["x-mock"] === undefined);
                done();
            })["catch"](done);
        });

        it("does not mock once removed (reset)", function (done) {
            gpf.http.mock.reset();
            mockId = undefined;
            gpf.http.get(baseUrl + "?status=200").then(function (response) {
                assert(response.status === 200);
                assert(response.headers["x-mock"] === undefined);
                done();
            })["catch"](done);
        });

        it("does not fail if removed twice", function () {
            gpf.http.mock.reset();
            gpf.http.mock.remove(mockId);
            mockId = undefined;
        });

    });

    describe("Advanced mocking example", function () {

        var mockIdForResponse3;

        beforeEach(function () {

            function getResponse (index) {
                return function () {
                    return {
                        status: 200,
                        headers: {},
                        responseText: "answer-" + index
                    };
                };
            }

            gpf.http.mock({
                method: gpf.http.methods.get,
                url: /echo\/lifo/,
                response: getResponse(1)
            });
            gpf.http.mock({
                method: gpf.http.methods.get,
                url: /echo\/lifo/,
                response: getResponse(2)
            });
            mockIdForResponse3 = gpf.http.mock({
                method: gpf.http.methods.get,
                url: /echo\/lifo/,
                response: getResponse(3)
            });
            gpf.http.mock({
                method: gpf.http.methods.put,
                url: /echo\/lifo/,
                response: getResponse(4)
            });
            gpf.http.mock({
                method: gpf.http.methods.get,
                url: /echo\/redirect/,
                response: function (request) {
                    return gpf.http.get(request.url.replace("/redirect", "/lifo"));
                }
            });
        });

        afterEach(function () {
            gpf.http.mock.reset();
        });

        it("uses LIFO priority", function (done) {
            gpf.http.get(baseUrl + "lifo").then(function (response) {
                assert(response.status === 200);
                assert(response.responseText === "answer-3");
                done();
            })["catch"](done);
        });

        it("preserves the order when removing a mocked request", function (done) {
            gpf.http.mock.remove(mockIdForResponse3);
            gpf.http.get(baseUrl + "lifo").then(function (response) {
                assert(response.status === 200);
                assert(response.responseText === "answer-2");
                done();
            })["catch"](done);
        });

        it("allows redirection", function (done) {
            gpf.http.get(baseUrl + "redirect").then(function (response) {
                assert(response.status === 200);
                assert(response.responseText === "answer-3");
                done();
            })["catch"](done);
        });

    });

});
