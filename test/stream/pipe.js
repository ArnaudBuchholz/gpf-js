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

    describe("Chaining an IReadableStream with an IWritableStream", function () {

        it("Transfer data", function (done) {
            var iWritableStream = new gpf.stream.WritableString();
            gpf.stream.pipe(new gpf.stream.ReadableString("Hello World"), iWritableStream)
                .then(function () {
                    assert(iWritableStream.toString() === "Hello World");
                    done();
                })["catch"](done);
        });

        it("Triggers flush when the read ends", function (done) {
            var iWritableStream = new gpf.stream.WritableString(),
                flushed = false;
            iWritableStream.flush = function () {
                flushed = true;
                return Promise.resolve();
            };
            gpf.stream.pipe(new gpf.stream.ReadableString("Hello World"), iWritableStream)
                .then(function () {
                    assert(iWritableStream.toString() === "Hello World");
                    assert(flushed);
                    done();
                })["catch"](done);
        });

    });

});
