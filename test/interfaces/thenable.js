"use strict";

describe("interfaces/thenable", function () {

    describe("gpf.interfaces.IThenable", function () {

        function ignore (value) {
            return value;
        }

        function testApi (name) {
            var method = gpf[name].bind(gpf);
            // Conversion expected
            [
                null,
                0,
                "",
                false,
                true,
                {},
                "Hello World!",
                7
            ].forEach(function (value) {
                it("converts " + JSON.stringify(value) + " into a promise", function (done) {
                    try {
                        method(value).then(function (resultValue) {
                            assert(value === resultValue);
                            done();
                        });
                    } catch (e) {
                        done(e);
                    }
                });
            });

            it("returns the promise parameter", function () {
                var promise = Promise.resolve();
                assert(promise === method(promise));
            });

            it("returns the IThenable parameter", function (done) {
                try {
                    var thenable = {
                            then: function (onFulfilled, onRejected) {
                                ignore(onRejected);
                                onFulfilled("ok");
                            }
                        },
                        promisified = method(thenable);
                    assert(thenable === promisified);
                    promisified.then(function (value) {
                        assert(value === "ok");
                        done();
                    });
                } catch (e) {
                    done(e);
                }
            });

        }

        describe("gpf.promisify", function () {

            it("converts undefined into a promise", function (done) {
                try {
                    gpf.promisify().then(function (resultValue) {
                        assert(undefined === resultValue);
                        done();
                    });
                } catch (e) {
                    done(e);
                }
            });

            testApi("promisify");

        });

        describe("gpf.promisifyDefined", function () {

            it("returns undefined with undefined", function () {
                assert(gpf.promisifyDefined(undefined) === undefined);
            });

            testApi("promisifyDefined");

        });

    });

});
