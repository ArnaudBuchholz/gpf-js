"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

/*eslint-disable max-nested-callbacks*/

describe("promise", function () {

    describe("simple usage", function () {

        it("waits for fulfilment", function (done) {
            new Promise(function (resolve/*, reject*/) {
                assert("function" === typeof resolve);
                setTimeout(function () {
                    resolve("ok");
                });
            }).then(function (value) {
                assert("ok" === value);
                done();
            });
        });

        it("also waits for rejection", function (done) {
            new Promise(function (resolve, reject) {
                assert("function" === typeof resolve);
                assert("function" === typeof reject);
                setTimeout(function () {
                    reject("ko");
                });
            }).then(function () {
                assert(false);
            }, function (reason) {
                assert("ko" === reason);
                done();
            });
        });

        it("rejects automatically on exception", function (done) {
            new Promise(function (resolve, reject) {
                assert("function" === typeof resolve);
                assert("function" === typeof reject);
                throw new Error("ko");
            }).then(function () {
                assert(false);
            }, function (reason) {
                assert(reason instanceof Error);
                assert("ko" === reason.message);
                done();
            });
        });

    });

});
