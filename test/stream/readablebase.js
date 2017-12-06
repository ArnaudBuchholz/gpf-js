"use strict";

describe("stream/readablebase", function () {

    describe("gpf.stream.ReadableBase", function () {

        var TestReadable = gpf.define({
            $class: "TestReadable",
            $extend: "gpf.stream.ReadableBase",

            //region Exposes protected interface

            write: function () {
                return this._outputWrite.apply(this, arguments);
            },

            flush: function () {
                return this._outputFlush.apply(this, arguments);
            },

            error: function () {
                return this._outputError.apply(this, arguments);
            }

            //endregion

        });

        it("exposes IReadableStream", function () {
            assert(gpf.interfaces.isImplementedBy(gpf.interfaces.IReadableStream, gpf.stream.ReadableBase));
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
                .write("Hello", "World!")
                .then(function () {
                    myReadable.flush();
                });
        });

    });

});
