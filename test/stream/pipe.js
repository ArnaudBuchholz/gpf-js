"use strict";

describe("stream/pipe", function () {

    it("chains an IReadableStream with a IWritableStream", function (done) {
        var iWritableStream = new gpf.stream.WritableString();
        gpf.stream.pipe(new gpf.stream.ReadableString("Hello World"), iWritableStream)
            .then(function () {
                assert(iWritableStream.toString() === "Hello World");
                done();
            });
    });

});
