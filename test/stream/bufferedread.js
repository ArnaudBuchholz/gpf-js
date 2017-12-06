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

        function _checkOutcome (iReadableStream, done) {
            var iWritableArray = new gpf.stream.WritableArray();
            gpf.stream.pipe(iReadableStream, iWritableArray)
                .then(function () {
                    var result = iWritableArray.toArray();
                    assert(result.length === 2);
                    assert(result[0] === "Hello");
                    assert(result[1] === "World!");
                    done();
                })["catch"](done);
        }

        it("outputs data before reading", function (done) {
            var myReadable = new TestReadable();
            myReadable
                .appendToReadBuffer("Hello", "World!")
                .completeReadBuffer();
            _checkOutcome(myReadable, done);
        });

        it("outputs data while reading", function (done) {
            var myReadable = new TestReadable();
            myReadable.appendToReadBuffer("Hello");
            _checkOutcome(myReadable, done);
            myReadable
                .appendToReadBuffer("World!")
                .completeReadBuffer();
        });

        it("outputs data after reading", function (done) {
            var myReadable = new TestReadable();
            _checkOutcome(myReadable, done);
            myReadable
                .appendToReadBuffer("Hello", "World!")
                .completeReadBuffer();
        });

    });

});
