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

        function _pipe (iReadableStream) {
            var iWritableArray = new gpf.stream.WritableArray();
            return gpf.stream.pipe(iReadableStream, iWritableArray)
                .then(function () {
                    return iWritableArray.toArray();
                });
        }

        function _checkResult (iReadableStream, done) {
            _pipe(iReadableStream)
                .then(function (result) {
                    assert(result.length === 2);
                    assert(result[0] === "Hello");
                    assert(result[1] === "World!");
                    done();
                })["catch"](done);
        }

        describe("data output", function () {

            it("outputs data before reading", function (done) {
                var myReadable = new TestReadable();
                myReadable
                    .appendToReadBuffer("Hello", "World!")
                    .completeReadBuffer();
                _checkResult(myReadable, done);
            });

            it("outputs data while reading", function (done) {
                var myReadable = new TestReadable();
                myReadable.appendToReadBuffer("Hello");
                _checkResult(myReadable, done);
                myReadable
                    .appendToReadBuffer("World!")
                    .completeReadBuffer();
            });

            it("outputs data after reading", function (done) {
                var myReadable = new TestReadable();
                _checkResult(myReadable, done);
                myReadable
                    .appendToReadBuffer("Hello", "World!")
                    .completeReadBuffer();
            });

        });

        describe("error management", function () {

            function _ignore (data) {
                return data;
            }

            function _checkError (iReadableStream, done) {
                _pipe(iReadableStream)
                    .then(function () {
                        throw new Error("Should fail");
                    }, function (reason) {
                        assert(reason.message === "FAIL");
                        done();
                    })["catch"](done);
            }

            it("generates errors before reading", function (done) {
                var myReadable = new TestReadable();
                myReadable
                    .appendToReadBuffer("Hello", "World!")
                    .setReadError(new Error("FAIL"));
                _checkError(myReadable, done);
            });

            it("generates errors while reading", function (done) {
                var myReadable = new TestReadable();
                myReadable.appendToReadBuffer("Hello");
                _checkError(myReadable, done);
                myReadable.appendToReadBuffer("World!")
                    .setReadError(new Error("FAIL"));
            });

            it("generates errors after reading", function (done) {
                var myReadable = new TestReadable();
                _checkError(myReadable, done);
                myReadable
                    .appendToReadBuffer("Hello", "World!")
                    .setReadError(new Error("FAIL"));
            });

            function _checkWriteError (iWritableStream, done) {
                var myReadable = new TestReadable();
                myReadable
                    .appendToReadBuffer("Hello", "World!")
                    .completeReadBuffer();
                gpf.stream.pipe(myReadable, iWritableStream)
                    .then(function () {
                        throw new Error("Should fail");
                    }, function (reason) {
                        assert(reason.message === "FAIL");
                        done();
                    })["catch"](done);
            }

            it("forwards errors (exception)", function (done) {
                _checkWriteError({
                    write: function (data) {
                        _ignore(data);
                        throw new Error("FAIL");
                    }
                }, done);
            });

            it("forwards errors (reject)", function (done) {
                _checkWriteError({
                    write: function (data) {
                        _ignore(data);
                        return Promise.reject(new Error("FAIL"));
                    }
                }, done);
            });

        });

    });

});
