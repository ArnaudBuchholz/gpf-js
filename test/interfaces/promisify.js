"use strict";

describe("interfaces/promisify", function () {

    describe("gpf.interfaces.promisify", function () {

        function ignore (value) {
            return value;
        }

        var ISample,
            wrapSample,
            SampleImpl;

        // Setting up classes
        before(function () {
            ISample = gpf.define({
                $interface: "ISample",
                test: function (value) {
                    ignore(value);
                }
            });
            wrapSample = gpf.interfaces.promisify(ISample);
            SampleImpl = gpf.define({
                $class: "SampleImpl",
                test: function (value) {
                    if (value === 0) {
                        throw new Error("OK");
                    }
                    return value + 1;
                }
            });
        });

        it("accepts only an object implementing the interface", function () {
            var exceptionCaught;
            try {
                wrapSample({
                    notTheExpectedTestMethod: function () {}
                });
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.InterfaceExpected);
        });

        it("leverages IUnkown", function () {
            var exceptionCaught;
            try {
                wrapSample({
                    queryInterface: function (interfaceSpecifier) {
                        if (interfaceSpecifier === ISample) {
                            return new SampleImpl();
                        }
                    }
                });
            } catch (e) {
                exceptionCaught = e;
            }
            assert(!exceptionCaught);
        });

        it("allows chaining", function (done) {
            var wrapped = wrapSample(new SampleImpl());
            wrapped
                .test(1)
                .test(2)
                .test(3)
                .then(function (value) {
                    assert(value === 4);
                    done();
                })["catch"](done);
        });

        it("forwards errors", function (done) {
            var wrapped = wrapSample(new SampleImpl());
            wrapped
                .test(1)
                .test(0)
                .test(3)
                .then(function () {
                    assert(false);
                })["catch"](function (reason) {
                    try {
                        assert(reason.message === "OK");
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
        });

        it("offers advanced promise chaining", function (done) {
            var wrapped = wrapSample(new SampleImpl());
            wrapped
                .test(1)
                .test(2)
                .then(function () {
                    return 0;
                })
                .then(function (value) {
                    assert(value === 0);
                })
                .test(3)
                .then(function (value) {
                    assert(value === 4);
                    done();
                })["catch"](done);
        });

    });

});
