"use strict";

describe("http", function () {

    it("knows config.httpPort", function () {
        assert(typeof config === "object" && typeof config.httpPort === "number");
    });

    describe("gpf.http", function () {

        if (config.performance) {
            it("is not relevant for performance testing", function () {
                assert(true);
            });
            return;
        }

        if (config.httpPort === 0) {
            it("is not tested in this environment because config.httpPort = 0", function () {
                assert(true);
            });
            return;
        }

        var baseUrl;

        before(function () {
            baseUrl = "http://localhost:" + config.httpPort + "/echo/?";
        });

        describe("basics", function () {
            it("allows the GET operation", function (done) {
                gpf.http.request({
                    method: gpf.http.methods.get,
                    url: baseUrl + "status=200"

                }).then(function (response) {
                    assert(response.status === 200);
                    var echoed = JSON.parse(response.responseText);
                    assert(echoed.method === "GET");
                    assert(echoed.url === "/echo/?status=200");
                    done();
                })["catch"](done);
            });

            it("offers the GET shortcut (using string parameter)", function (done) {
                gpf.http.get(baseUrl + "status=200").then(function (response) {
                    assert(response.status === 200);
                    var echoed = JSON.parse(response.responseText);
                    assert(echoed.method === "GET");
                    assert(echoed.url === "/echo/?status=200");
                    done();
                })["catch"](done);
            });

            it("offers the GET shortcut (using object parameter)", function (done) {
                gpf.http.get({
                    url: baseUrl + "status=200&response=Hello%20World"
                }).then(function (response) {
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

            it("succeeds when the HTTP response is empty", function (done) {
                gpf.http.get(baseUrl + "response=").then(function (response) {
                    assert(response.responseText === "");
                    done();
                })["catch"](done);
            });
        });

        describe("headers", function () {
            it("forwards request headers", function (done) {
                gpf.http.request({
                    method: gpf.http.methods.get,
                    url: baseUrl + "status=200",
                    headers: {
                        "x-test": "Value"
                    }

                }).then(function (response) {
                    assert(response.status === 200);
                    assert(response.headers["x-test"] === "Value");
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

        describe("methods", function () {
            [
                "post",
                "put",
                "options",
                "delete",
                "head"

            ].forEach(function (method, index) {

                var uppercasedMethod = method.toUpperCase(),
                    body,
                    checkResponse;

                if (index < 2) { // post & put
                    body = "Hello World";
                }

                if (method === "head") {
                    checkResponse = function () {}; // No response expected
                } else {
                    checkResponse = function (responseText) {
                        var echoed = JSON.parse(responseText);
                        assert(echoed.method === uppercasedMethod);
                        assert(echoed.url === "/echo/?status=200");
                        if (body) {
                            assert(echoed.body === body);
                        } else {
                            assert(!echoed.body);
                        }
                    };
                }

                it("allows the " + uppercasedMethod + " operation", function (done) {
                    gpf.http.request({
                        method: gpf.http.methods[method],
                        url: baseUrl + "status=200",
                        data: body

                    }).then(function (response) {
                        assert(response.status === 200);
                        checkResponse(response.responseText);
                        done();
                    })["catch"](done);
                });

                it("offers the " + uppercasedMethod + " shortcut", function (done) {
                    gpf.http[method](baseUrl + "status=200", body).then(function (response) {
                        assert(response.status === 200);
                        checkResponse(response.responseText);
                        done();
                    })["catch"](done);
                });

            });

            if ([gpf.hosts.nodejs].indexOf(gpf.host()) !== -1) {
                it("allows any verb (MERGE)", function (done) {
                    gpf.http.request({
                        method: "merge",
                        url: baseUrl + "status=200"

                    }).then(function (response) {
                        assert(response.status === 200);
                        var echoed = JSON.parse(response.responseText);
                        assert(echoed.method === "MERGE");
                        assert(echoed.url === "/echo/?status=200");
                        done();
                    })["catch"](done);
                });
            }
        });

        if (gpf.hosts.browser !== gpf.host()) {

            describe("https", function () {

                it("handles https access", function (done) {
                    gpf.http.get("https://www.google.com/").then(function (response) {
                        assert(response.status === 200);
                        done();
                    })["catch"](done);
                });

            });

        }

    });

});
