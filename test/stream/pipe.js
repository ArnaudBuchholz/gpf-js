"use strict";

function ignore (x) {
    return x;
}

describe("stream/pipe", function () {

    describe("parameters validation", function () {

        function _read (iWritableStream) {
            ignore(iWritableStream);
        }

        function _write (data) {
            ignore(data);
        }

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
                    read: _read
                });
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.InterfaceExpected);
        });

        describe("handling a sequence with more than two streams", function () {

            it("misses intermediate read", function () {
                var exceptionCaught;
                try {
                    gpf.stream.pipe({
                        read: _read
                    }, {
                        write: _write
                    }, {
                        write: _write
                    });
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.InterfaceExpected);
            });

            it("misses intermediate write", function () {
                var exceptionCaught;
                try {
                    gpf.stream.pipe({
                        read: _read
                    }, {
                        read: _read
                    }, {
                        write: _write
                    });
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.InterfaceExpected);
            });

            it("does not end with write", function () {
                var exceptionCaught;
                try {
                    gpf.stream.pipe({
                        read: _read
                    }, {
                        read: _read,
                        write: _write
                    }, {
                    });
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.InterfaceExpected);
            });

        });

    });

    describe("IReadableStream -> IWritableStream", function () {

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

        it("Forward errors (read - reject)", function (done) {
            var iWritableStream = new gpf.stream.WritableString(),
                iReadableStream = {
                    read: function (iOutput) {
                        ignore(iOutput);
                        return Promise.reject("FAIL");
                    }
                };
            gpf.stream.pipe(iReadableStream, iWritableStream)
                .then(function () {
                    throw new Error("Should fail");
                }, function (reason) {
                    assert(reason === "FAIL");
                    done();
                })["catch"](done);
        });

        it("Forward errors (read - exception)", function (done) {
            var iWritableStream = new gpf.stream.WritableString(),
                iReadableStream = {
                    read: function (iOutput) {
                        ignore(iOutput);
                        throw new Error("FAIL");
                    }
                };
            gpf.stream.pipe(iReadableStream, iWritableStream)
                .then(function () {
                    throw new Error("Should fail");
                }, function (reason) {
                    assert(reason.message === "FAIL");
                    done();
                })["catch"](done);
        });

        it("Forward errors (write - reject)", function (done) {
            var iWritableStream = {
                write: function (data) {
                    ignore(data);
                    return Promise.reject("FAIL");
                }
            };
            gpf.stream.pipe(new gpf.stream.ReadableString("Hello World"), iWritableStream)
                .then(function () {
                    throw new Error("Should fail");
                }, function (reason) {
                    assert(reason === "FAIL");
                    done();
                })["catch"](done);
        });

        it("Forward errors (write - exception)", function (done) {
            var iWritableStream = {
                write: function (data) {
                    ignore(data);
                    throw new Error("FAIL");
                }
            };
            gpf.stream.pipe(new gpf.stream.ReadableString("Hello World"), iWritableStream)
                .then(function () {
                    throw new Error("Should fail");
                }, function (reason) {
                    assert(reason.message === "FAIL");
                    done();
                })["catch"](done);
        });

    });

    describe("IReadableStream -> IReadableStream/IWritableStream -> IWritableStream", function () {

        it("handles the whole stream", function (done) {
            var iReadableArray = new gpf.stream.ReadableArray([
                    "Hello ",
                    "World!",
                    "\n",
                    "Goodbye!"
                ]),
                iLineAdapter = new gpf.stream.LineAdapter(),
                iWritableArray = new gpf.stream.WritableArray();
            gpf.stream.pipe(iReadableArray, iLineAdapter, iWritableArray)
                .then(function () {
                    var result = iWritableArray.toArray();
                    assert(result.length === 2);
                    assert(result[0] === "Hello World!");
                    assert(result[1] === "Goodbye!");
                    done();
                })["catch"](done);
        });

        it("handles non flushable intermediate stream", function (done) {
            var iReadableArray = new gpf.stream.ReadableArray([
                    "Hello ",
                    "World!",
                    "\n",
                    "Goodbye!"
                ]),
                intermediate = (function () {
                    var
                        _data,
                        _writable;
                    function _forget () {
                        _data = undefined;
                        _writable = undefined;
                    }
                    return {
                        read: function (iWritable) {
                            _writable = iWritable;
                            if (undefined !== _data) {
                                return _writable.write(_data).then(_forget);
                            }
                            return Promise.resolve();
                        },
                        write: function (data) {
                            _data = data;
                            if (_writable) {
                                return _writable.write(data).then(_forget);
                            }
                            return Promise.resolve();
                        }
                    };
                }()),
                iWritableArray = new gpf.stream.WritableArray();
            gpf.stream.pipe(iReadableArray, intermediate, iWritableArray)
                .then(function () {
                    var result = iWritableArray.toArray();
                    assert(result.length === 2);
                    assert(result[0] === "Hello World!");
                    assert(result[1] === "Goodbye!");
                    done();
                })["catch"](done);
        });

    });

});
