"use strict";

describe("stream/array", function () {

    var array = ["Hell", "o ", "World", null, {}];

    function compare (result, done) {
        try {
            assert(array.length === result.length);
            array.forEach(function (value, index) {
                assert(value === result[index]);
            });
            done();
        } catch (e) {
            done(e);
        }
    }

    describe("gpf.stream.ReadableArray", function () {

        it("writes each array item sequentially", function (done) {
            var iReadableStream = new gpf.stream.ReadableArray(array),
                result = [];
            iReadableStream.read({
                write: function (item) {
                    result.push(item);
                    return Promise.resolve();
                }
            })
                .then(function () {
                    compare(result, done);
                }, done);
        });

    });

    describe("gpf.stream.WritableArray", function () {

        it("stores each call as an array item", function (done) {
            var iWritableStream = new gpf.stream.WritableArray(),
                step = 0;
            function write () {
                if (array.length === step) {
                    compare(iWritableStream.toArray(), done);
                } else {
                    iWritableStream.write(array[step++]).then(write, done);
                }
            }
            write();
        });

    });

});
