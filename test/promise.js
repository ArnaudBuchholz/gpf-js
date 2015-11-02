"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

/*eslint-disable max-nested-callbacks*/

describe("promise", function () {

    function generateTests (PromiseClass) {

        describe("simple usage", function () {

            it("waits for synchronous fulfilment", function (done) {
                new PromiseClass(function (resolve/*, reject*/) {
                    assert("function" === typeof resolve);
                    resolve("ok");
                })
                    .then(function (value) {
                        assert("ok" === value);
                        done();
                    });
            });

            it("waits for asynchronous fulfilment", function (done) {
                new PromiseClass(function (resolve/*, reject*/) {
                    assert("function" === typeof resolve);
                    setTimeout(function () {
                        resolve("ok");
                    });
                })
                    .then(function (value) {
                        assert("ok" === value);
                        done();
                    });
            });

            it("waits for synchronous rejection (rejection handler)", function (done) {
                var fulfilled = false;
                new PromiseClass(function (resolve, reject) {
                    assert("function" === typeof resolve);
                    assert("function" === typeof reject);
                    reject("ko");
                })
                    .then(function () {
                        fulfilled = true;
                    }, function (reason) {
                        assert(false === fulfilled);
                        assert("ko" === reason);
                        done();
                    });
            });

            it("waits for asynchronous rejection (rejection handler)", function (done) {
                var fulfilled = false;
                new PromiseClass(function (resolve, reject) {
                    assert("function" === typeof resolve);
                    assert("function" === typeof reject);
                    setTimeout(function () {
                        reject("ko");
                    });
                })
                    .then(function () {
                        fulfilled = true;
                    }, function (reason) {
                        assert(false === fulfilled);
                        assert("ko" === reason);
                        done();
                    });
            });

            it("waits for synchronous rejection (catch handler)", function (done) {
                new PromiseClass(function (resolve, reject) {
                    assert("function" === typeof resolve);
                    assert("function" === typeof reject);
                    reject("ko");
                })
                    .then(function () {
                        assert(false);
                    })
                    .catch(function (reason) {
                        assert("ko" === reason);
                        done();
                    });
            });

            it("waits for asynchronous rejection (catch handler)", function (done) {
                new PromiseClass(function (resolve, reject) {
                    assert("function" === typeof resolve);
                    assert("function" === typeof reject);
                    setTimeout(function () {
                        reject("ko");
                    });
                })
                    .then(function () {
                        assert(false);
                    })
                    .catch(function (reason) {
                        assert("ko" === reason);
                        done();
                    });
            });

            it("rejects automatically on exception", function (done) {
                new PromiseClass(function (resolve, reject) {
                    assert("function" === typeof resolve);
                    assert("function" === typeof reject);
                    throw new Error("ko");
                })
                    .then(function () {
                        assert(false);
                    }, function (reason) {
                        assert(reason instanceof Error);
                        assert("ko" === reason.message);
                        done();
                    });
            });

            it("catches exception from the fulfilment handler", function (done) {
                new PromiseClass(function (resolve, reject) {
                    assert("function" === typeof resolve);
                    assert("function" === typeof reject);
                    setTimeout(function () {
                        resolve("ok");
                    });
                })
                    .then(function (value) {
                        assert("ok" === value);
                        throw new Error("ko");
                    })
                    .catch(function (reason) {
                        assert(reason instanceof Error);
                        assert("ko" === reason.message);
                        done();
                    });
            });

            it("catches exception from the rejection handler", function (done) {
                new PromiseClass(function (resolve, reject) {
                    assert("function" === typeof resolve);
                    assert("function" === typeof reject);
                    setTimeout(function () {
                        reject("ko");
                    });
                })
                    .then(function () {
                        assert(false);
                    }, function (reason) {
                        assert("ko" === reason);
                        throw new Error("ko");
                    })
                    .catch(function (reason) {
                        assert(reason instanceof Error);
                        assert("ko" === reason.message);
                        done();
                    });
            });

        });

    }

    describe("Promise", function () {

        generateTests (Promise);

    });

    if (gpf.internals && Promise !== gpf.internals._GpfPromise) {

        describe("(internal) _GpfPromise", function () {

            generateTests(gpf.internals._GpfPromise);

        });

    }

});
