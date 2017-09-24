"use strict";

describe("gpf.http.mock", function () {

    var baseUrl;

    before(function () {
        baseUrl = "http://localhost:" + config.httpPort + "/echo/?";
    });

    it("exposes a method to mock requests", function () {
        assert("function" === typeof gpf.http.mock);
    });

    it("exposes a method to cancel one specific mocking", function () {
        assert("function" === typeof gpf.http.mock.remove);
    });

    it("exposes a method to reset all mocking", function () {
        assert("function" === typeof gpf.http.mock.reset);
    });

    describe("first mocking example", function () {

        var mockId;

        before(function () {
            mockId = gpf.http.mock({
                method: gpf.http.get,
                url: /echo\?status=([0-9]+)/,
                response: function (request, status) {
                    return Promise.resolve({
                        status: String(parseInt(status, 10) + 1),
                        headers: {
                            "x-mock": true
                        },
                        responseText: "It works"
                    });
                }
            });
        });

        after(function () {
            gpf.http.mock.remove(mockId);
        });

        it("matches request URL and method", function (done) {
            gpf.http.get(baseUrl + "status=200").then(function (response) {
                assert(response.status === "201");
                assert(response.headers["x-mock"] === true);
                assert(response.responseText === "It works");
                done();
            })["catch"](done);
        });

    });

});

