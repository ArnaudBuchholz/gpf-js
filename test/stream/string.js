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

});
