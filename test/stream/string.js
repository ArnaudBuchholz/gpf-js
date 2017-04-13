"use strict";

describe("stream/string", function () {

    describe("gpf.stream.ReadableString", function () {

        // it("is secured", function () {
        //
        // });

        it("writes to an IWritableStream", function (done) {
            var iWritableStream = new gpf.stream.WritableString(),
                iReadableStream = new gpf.stream.ReadableString("Hello World");
            iReadableStream.read(iWritableStream)
                .then(function () {
                    assert(iWritableStream.toString() === "Hello World");
                    done();
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
