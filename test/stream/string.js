"use strict";

describe("stream/string", function () {

    describe("gpf.stream.ReadableString", function () {

        it("is accepts only IWritableStream", function () {
            var iReadableStream = new gpf.stream.ReadableString("Hello World"),
                exceptionCaught;
            try {
                iReadableStream.read({});
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.InterfaceExpected);
        });

        it("is protected against parallel calls", function () {
            var iWritableStream = {
                    write: function (buffer) {
                        assert("string" === typeof buffer);
                        return new Promise(function () {});
                    }
                },
                iReadableStream = new gpf.stream.ReadableString("Hello World"),
                exceptionCaught;
            try {
                iReadableStream.read(iWritableStream);
                iReadableStream.read(iWritableStream);
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.ReadInProgress);
        });

        it("writes to an IWritableStream", function (done) {
            var iWritableStream = new gpf.stream.WritableString(),
                iReadableStream = new gpf.stream.ReadableString("Hello World");
            iReadableStream.read(iWritableStream)
                .then(function () {
                    assert(iWritableStream.toString() === "Hello World");
                    done();
                });
        });

        it("forwards any error", function (done) {
            var iWritableStream = {
                    write: function (buffer) {
                        assert("string" === typeof buffer);
                        return Promise.reject(1);
                    }
                },
                iReadableStream = new gpf.stream.ReadableString("Hello World");
            iReadableStream.read(iWritableStream)
                .then(function () {}, function (reason) {
                    var exceptionCaught;
                    try {
                        assert(reason === 1);
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    done(exceptionCaught);
                });
        });

    });

    describe("gpf.stream.WritableString", function () {

        it("is protected against parallel calls", function () {
            var exceptionCaught,
                iWritableStream = new gpf.stream.WritableString();
            try {
                iWritableStream.write("1");
                iWritableStream.write("2");
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.WriteInProgress);
        });

        it("supports multiple sequenced calls", function (done) {
            var iWritableStream = new gpf.stream.WritableString();
            iWritableStream.write("Hell")
                .then(function () {
                    return iWritableStream.write("o ");
                })
                .then(function () {
                    return iWritableStream.write("World");
                })
                .then(function () {
                    assert(iWritableStream.toString() === "Hello World");
                    done();
                });
        });

    });

});
