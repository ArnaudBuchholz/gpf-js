"use strict";

describe("stream/bufferedread", function () {

    describe("gpf.stream.BufferedRead", function () {

        var TestReadable = gpf.define({
            $class: "TestReadable",
            $extend: "gpf.stream.BufferedRead",

            //region Exposes protected interface

            appendToReadBuffer: function () {
                return this._appendToReadBuffer.apply(this, arguments);
            },

            completeReadBuffer: function () {
                return this._completeReadBuffer.apply(this, arguments);
            },

            setReadError: function () {
                return this._setReadError.apply(this, arguments);
            }

            //endregion

        });

        it("exposes IReadableStream", function () {
            assert(gpf.interfaces.isImplementedBy(gpf.interfaces.IReadableStream, TestReadable));
        });

        it("outputs data", function (done) {
            var myReadable = new TestReadable(),
                iWritableArray = new gpf.stream.WritableArray();
            gpf.stream.pipe(myReadable, iWritableArray)
                .then(function () {
                    var result = iWritableArray.toArray();
                    assert(result.length === 2);
                    assert(result[0] === "Hello");
                    assert(result[1] === "World!");
                    done();
                })["catch"](done);
            myReadable
                .appendToReadBuffer("Hello", "World!")
                .completeReadBuffer();
        });

    });

});
