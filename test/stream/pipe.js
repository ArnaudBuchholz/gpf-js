"use strict";

describe("stream/pipe", function () {

    describe("parameters validation", function () {

        it("fails if the first parameter is not an IReadableStream", function () {
            var exceptionCaught;
            try {
                gpf.stream.pipe({});
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.InterfaceExpected);
        });

        it("fails if no destination", function () {
            var exceptionCaught;
            try {
                gpf.stream.pipe({
                    read: function (iWritableStream) {
                        return Promise.resolve(iWritableStream);
                    }
                });
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.InterfaceExpected);
        });

    });

    it("chains an IReadableStream with a IWritableStream", function (done) {
        var iWritableStream = new gpf.stream.WritableString();
        gpf.stream.pipe(new gpf.stream.ReadableString("Hello World"), iWritableStream)
            .then(function () {
                assert(iWritableStream.toString() === "Hello World");
                done();
            })["catch"](done);
    });

});
