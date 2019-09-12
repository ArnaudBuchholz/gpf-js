"use strict";

describe("stream/pipe", function () {

    function ignore (x) {
        return x;
    }

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

    var helpers = {
        _readRejectError: function (iOutput) {
            ignore(iOutput);
            return Promise.reject("FAIL");
        },

        _readThrowError: function (iOutput) {
            ignore(iOutput);
            throw new Error("FAIL");
        },

        _writeRejectError: function (data) {
            ignore(data);
            return Promise.reject("FAIL");
        },

        _writeThrowError: function (data) {
            ignore(data);
            throw new Error("FAIL");
        },

        _wrapForRejectionHandler: function (promise, done) {
            promise.then(function () {
                throw new Error("Should fail");
            }, function (reason) {
                assert(reason === "FAIL");
                done();
            })["catch"](done);
        },

        _wrapForExceptionHandler: function (promise, done) {
            promise.then(function () {
                throw new Error("Should fail");
            }, function (reason) {
                assert(reason.message === "FAIL");
                done();
            })["catch"](done);
        }
    };

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
                    read: helpers._readRejectError
                };
            helpers._wrapForRejectionHandler(gpf.stream.pipe(iReadableStream, iWritableStream), done);
        });

        it("Forward errors (read - exception)", function (done) {
            var iWritableStream = new gpf.stream.WritableString(),
                iReadableStream = {
                    read: helpers._readThrowError
                };
            helpers._wrapForExceptionHandler(gpf.stream.pipe(iReadableStream, iWritableStream), done);
        });

        it("Forward errors (write - reject)", function (done) {
            var iWritableStream = {
                write: helpers._writeRejectError
            };
            helpers._wrapForRejectionHandler(gpf.stream.pipe(new gpf.stream.ReadableString("Hello World"),
                iWritableStream), done);
        });

        it("Forward errors (write - exception)", function (done) {
            var iWritableStream = {
                write: helpers._writeThrowError
            };
            helpers._wrapForExceptionHandler(gpf.stream.pipe(new gpf.stream.ReadableString("Hello World"),
                iWritableStream), done);
        });

    });

    function _getNonFlushableStream () {
        var
            _data,
            _writable,
            _promise,
            _promiseResolve,
            _promiseReject;

        function _complete () {
            if (!_promise) {
                _promise = new Promise(function (resolve, reject) {
                    _promiseResolve = resolve;
                    _promiseReject = reject;
                });
            }
            if (_writable && _data) {
                var promise = _promise,
                    resolve = _promiseResolve,
                    reject = _promiseReject;
                _writable.write(_data).then(resolve, reject);
                _data = undefined;
                _writable = undefined;
                _promise = undefined;
                _promiseResolve = undefined;
                _promiseReject = undefined;
                return promise;
            }
            return _promise;
        }

        return {
            read: function (iWritable) {
                if (_writable) {
                    throw new Error("Already reading");
                }
                _writable = iWritable;
                return _complete();
            },
            write: function (data) {
                if (_data) {
                    throw new Error("Buffer full");
                }
                _data = data;
                return _complete();
            }
        };
    }

    function _pipe (streams) {
        var iReadableArray = new gpf.stream.ReadableArray([
                "Hello ",
                "World!",
                "\n",
                "Goodbye!"
            ]),
            iWritableArray = new gpf.stream.WritableArray();
        return gpf.stream.pipe.apply(gpf.stream, [iReadableArray].concat(streams, iWritableArray))
            .then(function () {
                return iWritableArray;
            });
    }

    function _validate (streams, done) {
        _pipe(streams)
            .then(function (iWritableArray) {
                var result = iWritableArray.toArray();
                assert(result.length === 2);
                assert(result[0] === "Hello World!");
                assert(result[1] === "Goodbye!");
                done();
            })["catch"](done);
    }

    describe("IReadableStream -> IReadableStream/IWritableStream* -> IWritableStream", function () {

        it("handles the whole stream", function (done) {
            _validate([new gpf.stream.LineAdapter()], done);
        });

        it("handles non flushable intermediate stream", function (done) {
            _validate([
                _getNonFlushableStream(),
                new gpf.stream.LineAdapter()
            ], done);
        });

        it("Forward errors (read - reject)", function (done) {
            var error = _getNonFlushableStream();
            error.read = helpers._readRejectError;
            helpers._wrapForRejectionHandler(_pipe([error, new gpf.stream.LineAdapter()]), done);
        });

        it("Forward errors (read - exception)", function (done) {
            var error = _getNonFlushableStream();
            error.read = helpers._readThrowError;
            helpers._wrapForExceptionHandler(_pipe([error, new gpf.stream.LineAdapter()]), done);
        });

        it("Forward errors (write - reject)", function (done) {
            var error = _getNonFlushableStream();
            error.write = helpers._writeRejectError;
            helpers._wrapForRejectionHandler(_pipe([error, new gpf.stream.LineAdapter()]), done);
        });

        it("Forward errors (write - exception)", function (done) {
            var error = _getNonFlushableStream();
            error.write = helpers._writeThrowError;
            helpers._wrapForExceptionHandler(_pipe([error, new gpf.stream.LineAdapter()]), done);
        });

        it("Forward errors (second read - reject)", function (done) {
            var nonFlushable = _getNonFlushableStream(),
                error = _getNonFlushableStream();
            error.read = helpers._readRejectError;
            helpers._wrapForRejectionHandler(_pipe([nonFlushable, error, new gpf.stream.LineAdapter()]), done);
        });

        it("Forward errors (second read - exception)", function (done) {
            var nonFlushable = _getNonFlushableStream(),
                error = _getNonFlushableStream();
            error.read = helpers._readThrowError;
            helpers._wrapForExceptionHandler(_pipe([nonFlushable, error, new gpf.stream.LineAdapter()]), done);
        });

        it("Forward errors (second write - reject)", function (done) {
            var nonFlushable = _getNonFlushableStream(),
                error = _getNonFlushableStream();
            error.write = helpers._writeRejectError;
            helpers._wrapForRejectionHandler(_pipe([nonFlushable, error, new gpf.stream.LineAdapter()]), done);
        });

        it("Forward errors (second write - exception)", function (done) {
            var nonFlushable = _getNonFlushableStream(),
                error = _getNonFlushableStream();
            error.write = helpers._writeThrowError;
            helpers._wrapForExceptionHandler(_pipe([nonFlushable, error, new gpf.stream.LineAdapter()]), done);
        });

    });

    if (gpf.stream.BufferedRead && gpf.stream.ReadableArray && gpf.stream.WritableArray) {

        describe("Data demultiplexing (one read generates several writes)", function () {
            var Demultiplexer;
            before(function () {
                Demultiplexer = gpf.define({
                    $class: "Demultiplexer",
                    $extend: "gpf.stream.BufferedRead",
                    write: function (number) {
                        this._appendToReadBuffer(3 * number);
                        this._appendToReadBuffer(3 * number + 1);
                        this._appendToReadBuffer(3 * number + 2);
                        return Promise.resolve();
                    },
                    flush: function () {
                        this._completeReadBuffer();
                        return Promise.resolve();
                    }
                });
            });
            it("Waits for all data to be processed", function (done) {
                var input = new gpf.stream.ReadableArray([0, 1, 2]),
                    demultiplexer = new Demultiplexer(),
                    output = new gpf.stream.WritableArray();
                gpf.stream.pipe(input, demultiplexer, output)
                    .then(function () {
                        try {
                            var array = output.toArray(),
                                index;
                            assert(array.length === 9);
                            for (index = 0; index < 9; ++index) {
                                assert(array[index] === index);
                            }
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });
        });

        describe("Data multiplexing (several reads generate one write)", function () {
            var Multiplexer;
            before(function () {
                Multiplexer = gpf.define({
                    $class: "Multiplexer",
                    $extend: "gpf.stream.BufferedRead",
                    write: function (number) {
                        if (number % 3 === 2) {
                            this._appendToReadBuffer((number - 2) / 3);
                        }
                        return Promise.resolve();
                    },
                    flush: function () {
                        this._completeReadBuffer();
                        return Promise.resolve();
                    }
                });
            });
            it("Waits for all data to be processed", function (done) {
                var input = new gpf.stream.ReadableArray([0, 1, 2, 3, 4, 5, 6, 7, 8]),
                    multiplexer = new Multiplexer(),
                    output = new gpf.stream.WritableArray();
                gpf.stream.pipe(input, multiplexer, output)
                    .then(function () {
                        try {
                            var array = output.toArray(),
                                index;
                            assert(array.length === 3);
                            for (index = 0; index < 3; ++index) {
                                assert(array[index] === index);
                            }
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });
        });

    }

});
