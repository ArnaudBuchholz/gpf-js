"use strict";

describe("foreachasync", function () {

    var
        array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        object = {};

    describe("gpf.forEachAsync", function () {

        [
            undefined,
            0,
            1,
            false,
            true,
            null
        ].forEach(function (invalidParameter) {
            it("rejects invalid parameter (" + JSON.stringify(invalidParameter) + ")", function () {
                var exceptionCaught;
                try {
                    gpf.forEachAsync(invalidParameter, function () {
                        assert(true);
                    });
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.InvalidParameter);
            });
        });

        it("enumerates an array synchronously", function (done) {
            var count = 0,
                sum = 0;
            gpf.forEachAsync(array, function (value, idx, refArray) {
                assert(this === object); //eslint-disable-line no-invalid-this
                assert(typeof idx === "number");
                assert(refArray === array);
                ++count;
                sum += value;
            }, object)
                .then(function () {
                    assert(array.length === count);
                    assert(sum === 45);
                    done();
                })["catch"](done);
        });

        it("enumerates an array asynchronously", function (done) {
            var count = 0,
                sum = 0;
            gpf.forEachAsync(array, function (value, idx, refArray) {
                assert(this === object); //eslint-disable-line no-invalid-this
                assert(typeof idx === "number");
                assert(refArray === array);
                ++count;
                sum += value;
                return Promise.resolve();
            }, object)
                .then(function () {
                    assert(array.length === count);
                    assert(sum === 45);
                    done();
                })["catch"](done);
        });

        it("catches any error", function (done) {
            gpf.forEachAsync(array, function () {
                throw new Error("OK");
            })
                .then(function () {
                    done(new Error("Not expected"));
                }, function (reason) {
                    assert(reason.message === "OK");
                    done();
                })["catch"](done);
        });

        it("catches any rejected promise", function (done) {
            gpf.forEachAsync(array, function () {
                return Promise.reject("OK");
            })
                .then(function () {
                    done(new Error("Not expected"));
                }, function (reason) {
                    assert(reason === "OK");
                    done();
                })["catch"](done);
        });

    });

});
