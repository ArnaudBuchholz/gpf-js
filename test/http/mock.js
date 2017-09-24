"use strict";

describe("gpf.http.mock", function () {

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
                        status: parseInt(status, 10) + 1,
                        headers: {
                            "x-mock": true
                        },
                        responseText: "It works"
                    });
                }
            });
        });

        after(function () {
            gpf.http.mock.remove
        });

    });

    it("mocks any request", function (done) {
        gpf.http.mock({
            method: gpf.http.get,
            url: /echo\?status=([0-9]+)/,
            response: function (request, status) {
                return Promise.resolve({
                    status: parseInt(status, 10) + 1,
                    headers: {
                        "x-mock": true
                    },
                    responseText: "It works"
                });
            }
        });

        gpf.http.get

    });

});

