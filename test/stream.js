"use strict";

describe("stream", function () {

    if (gpf.internals) {

        var _gpfStreamQueryReadable = gpf.internals._gpfStreamQueryReadable,
            _gpfStreamQueryWritable = gpf.internals._gpfStreamQueryWritable,
            _gpfStreamSecureInstallProgressFlag = gpf.internals._gpfStreamSecureInstallProgressFlag,
            _gpfStreamSecureRead = gpf.internals._gpfStreamSecureRead,
            _gpfStreamSecureWrite = gpf.internals._gpfStreamSecureWrite,
            _invalidValuesForQuery = [
                "",
                "Hello World !",
                false,
                true,
                null,
                undefined,
                0,
                1
            ];

        describe("(internal)", function () {

            describe("_gpfStreamQueryReadable", function () {

                it("checks if the parameters implements gpf.interfaces.IReadableStream", function () {
                    assert(_gpfStreamQueryReadable({
                        read: function (iWritableStream) {
                            assert(iWritableStream);
                        }
                    }));
                });

                it("fails when the parameters does not implement gpf.interfaces.IReadableStream", function () {
                    var exceptionCaught;
                    try {
                        _gpfStreamQueryReadable({});
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.InterfaceExpected);
                });

                _invalidValuesForQuery.forEach(function (value) {
                    it("fails when the parameters is invalid - " + JSON.stringify(value), function () {
                        var exceptionCaught;
                        try {
                            _gpfStreamQueryReadable(value);
                        } catch (e) {
                            exceptionCaught = e;
                        }
                        assert(exceptionCaught instanceof gpf.Error.InterfaceExpected);
                    });
                });

            });

            describe("_gpfStreamQueryWritable", function () {

                it("checks if the parameters implements gpf.interfaces.IWritableStream", function () {
                    assert(_gpfStreamQueryWritable({
                        write: function (buffer) {
                            assert(buffer);
                        }
                    }));
                });

                it("fails when the parameters does not implement gpf.interfaces.IWritaableStream", function () {
                    var exceptionCaught;
                    try {
                        _gpfStreamQueryWritable({});
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.InterfaceExpected);
                });

                _invalidValuesForQuery.forEach(function (value) {
                    it("fails when the parameters is invalid - " + JSON.stringify(value), function () {
                        var exceptionCaught;
                        try {
                            _gpfStreamQueryWritable(value);
                        } catch (e) {
                            exceptionCaught = e;
                        }
                        assert(exceptionCaught instanceof gpf.Error.InterfaceExpected);
                    });
                });

            });

            describe("_gpfStreamSecureRead", function () {

                function IReadableStream () {
                }

                IReadableStream.prototype = {

                    read: _gpfStreamSecureRead(function (iWritableStream) {
                        return iWritableStream.write("TEST");
                    })

                };

                _gpfStreamSecureInstallProgressFlag(IReadableStream);

                it("accepts only IWritableStream", function () {
                    var iReadableStream = new IReadableStream(),
                        exceptionCaught;
                    try {
                        iReadableStream.read({});
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.InterfaceExpected);
                });

                it("is protected against parallel calls", function () {
                    var iWritableStream = {
                            write: function (buffer) {
                                assert(buffer === "TEST");
                                return new Promise(function () {});
                            }
                        },
                        iReadableStream = new IReadableStream(),
                        exceptionCaught;
                    try {
                        iReadableStream.read(iWritableStream);
                        iReadableStream.read(iWritableStream);
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.ReadInProgress);
                });

                it("writes to an IWritableStream", function (done) {
                    var iWritableStream = {
                            write: function (buffer) {
                                assert(buffer === "TEST");
                                return Promise.resolve();
                            }
                        },
                        iReadableStream = new IReadableStream();
                    iReadableStream.read(iWritableStream)
                        .then(function () {
                            done();
                        });
                });

                it("forwards any error", function (done) {
                    var iWritableStream = {
                            write: function (buffer) {
                                assert(typeof buffer === "string");
                                return Promise.reject(1);
                            }
                        },
                        iReadableStream = new IReadableStream();
                    iReadableStream.read(iWritableStream)
                        .then(function () {}, function (reason) {
                            var exceptionCaught;
                            try {
                                assert(reason === 1);
                            } catch (e) {
                                exceptionCaught = e;
                            }
                            done(exceptionCaught);
                        });
                });

            });

            describe("_gpfStreamSecureWrite", function () {

                function IWritableStream () {
                }

                IWritableStream.prototype = {

                    write: _gpfStreamSecureWrite(function (buffer) {
                        if (buffer === "OK") {
                            return Promise.resolve();
                        }
                        return Promise.reject(buffer);
                    })

                };

                _gpfStreamSecureInstallProgressFlag(IWritableStream);

                it("is protected against parallel calls", function () {
                    var exceptionCaught,
                        iWritableStream = new IWritableStream();
                    try {
                        iWritableStream.write("OK");
                        iWritableStream.write("OK");
                    } catch (e) {
                        exceptionCaught = e;
                    }
                    assert(exceptionCaught instanceof gpf.Error.WriteInProgress);
                });

                it("forwards any error", function (done) {
                    var iWritableStream = new IWritableStream();
                    iWritableStream.write("KO")
                        .then(function () {}, function (reason) {
                            var exceptionCaught;
                            try {
                                assert(reason === "KO");
                            } catch (e) {
                                exceptionCaught = e;
                            }
                            done(exceptionCaught);
                        });
                });

            });

        });

    }

});
