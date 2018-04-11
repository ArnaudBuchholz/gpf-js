"use strict";

describe("fs", function () {

    var data = "test/data";

    describe("gpf.fs.getFileStorage", function () {

        function _createPath (path) {
            var parts = path.split("/"),
                index = -1,
                iFileStorage = gpf.fs.getFileStorage();
            function processPart () {
                ++index;
                if (index === parts.length) {
                    return Promise.resolve();
                }
                var subPath = parts.slice(0, index + 1).join("/");
                return iFileStorage.getInfo(subPath)
                    .then(function (info) {
                        if (info.type === gpf.fs.types.directory) {
                            return processPart();
                        }
                        if (info.type === gpf.fs.types.notFound) {
                            return iFileStorage.createDirectory(subPath).then(processPart);
                        }
                        return Promise.reject("ERROR");
                    });
            }
            return processPart();
        }

        function _removePath (path) {
            var parts = path.split("/"),
                iFileStorage = gpf.fs.getFileStorage();
            function processPart () {
                var subPath = parts.join("/");
                return iFileStorage.deleteDirectory(subPath)
                    .then(function () {
                        parts.pop();
                        if (parts.length > 3) {
                            return processPart();
                        }
                    });
            }
            return processPart();
        }

        function _checkFileBin (info) {
            assert(info.type === gpf.fs.types.file);
            assert(info.fileName === "file.bin");
            assert(info.filePath.indexOf(data + "/file.bin") !== -1);
            assert(info.size === 256);
            assert(info.createdDateTime instanceof Date);
            assert(info.createdDateTime.getUTCFullYear() > 2010);
            assert(info.modifiedDateTime instanceof Date);
            assert(info.modifiedDateTime.getUTCFullYear() > 2010);
        }

        function _checkFolder (info) {
            assert(info.type === gpf.fs.types.directory);
            assert(info.fileName === "folder");
            assert(info.filePath.indexOf(data + "/folder") !== -1);
            assert(info.createdDateTime instanceof Date);
            assert(info.createdDateTime.getUTCFullYear() > 2010);
            assert(info.modifiedDateTime instanceof Date);
            assert(info.modifiedDateTime.getUTCFullYear() > 2010);
        }

        if (gpf.fs.getFileStorage()) {

            var tmp = "tmp/fs/" + gpf.host() + "/"
                    + (new Date()).toISOString().replace(/-|T|:|\.|Z/g, "")
                    + "/" + Math.floor(100 * Math.random());

            it("returns a file storage interface", function () {
                assert(gpf.interfaces.isImplementedBy(gpf.interfaces.IFileStorage, gpf.fs.getFileStorage()));
            });

            describe("getInfo", function () {

                it("can get file information", function (done) {
                    gpf.fs.getFileStorage().getInfo(gpf.path.join(data, "file.bin"))
                        .then(_checkFileBin)
                        .then(done, done);
                });

                it("can get directory information", function (done) {
                    gpf.fs.getFileStorage().getInfo(gpf.path.join(data, "folder"))
                        .then(_checkFolder)
                        .then(done, done);
                });

                it("does not fail if the file does not exist", function (done) {
                    gpf.fs.getFileStorage().getInfo(gpf.path.join(data, "nope"))
                        .then(function (info) {
                            assert(info.type === gpf.fs.types.notFound);
                        })
                        .then(done, done);
                });

            });

            describe("openTextStream", function () {

                function _read (path, content) {
                    var iFileStorage = gpf.fs.getFileStorage(),
                        iWritableStream = new gpf.stream.WritableString();
                    return iFileStorage.openTextStream(path, gpf.fs.openFor.reading)
                        .then(function (iReadableStream) {
                            assert(gpf.interfaces.isImplementedBy(gpf.interfaces.IReadableStream, iReadableStream));
                            return iReadableStream.read(iWritableStream)
                                .then(function () {
                                    if (content) {
                                        assert(iWritableStream.toString() === content);
                                    }
                                    return iFileStorage.close(iReadableStream)
                                        .then(function () {
                                            return iWritableStream.toString();
                                        });
                                });
                        });
                }

                describe("read", function () {

                    it("reads a small text file", function (done) {
                        _read(gpf.path.join(data, "folder/hello world.txt"), "hello world\n")
                            .then(function () {
                                done();
                            }, done);
                    });

                    it("reads a larger text file", function (done) {
                        _read(gpf.path.join(data, "folder/lorem ipsum.txt"))
                            .then(function (content) {
                                assert(content.indexOf("Phasellus posuere.") !== -1); // Should contain it
                                done();
                            })["catch"](done);
                    });

                });

                describe("write", function () {

                    function _write (path, content) {
                        var iFileStorage = gpf.fs.getFileStorage();
                        return iFileStorage.openTextStream(path, gpf.fs.openFor.appending)
                            .then(function (iWritableStream) {
                                return iWritableStream.write(content)
                                    .then(function () {
                                        return iFileStorage.close(iWritableStream);
                                    });
                            });
                    }

                    before(function (done) {
                        _createPath(tmp)
                            .then(function () {
                                done();
                            }, done);
                    });

                    after(function (done) {
                        _removePath(tmp)
                            .then(function () {
                                done();
                            }, done);
                    });

                    describe("initial", function () {

                        var filePath = gpf.path.join(tmp, "hello world.txt");

                        before(function (done) {
                            _write(filePath, "hello world\n")
                                .then(done, done);
                        });

                        after(function (done) {
                            gpf.fs.getFileStorage().deleteFile(filePath)
                                .then(done, done);
                        });

                        it("writes a text file", function (done) {
                            _read(filePath, "hello world\n")
                                .then(function () {
                                    done();
                                }, done);
                        });

                        describe("append", function () {

                            it("appends a text file", function (done) {
                                _write(filePath, "goodbye\n")
                                    .then(function () {
                                        return _read(filePath, "hello world\ngoodbye\n");
                                    })
                                    .then(function () {
                                        done();
                                    }, done);
                            });

                        });

                    });

                });

            });

            describe("close", function () {

                it("rejects invalid streams", function (done) {
                    gpf.fs.getFileStorage().close({})
                        .then(function () {
                            throw new Error();
                        })
                        .then(undefined, function (e) {
                            assert(e instanceof gpf.Error.IncompatibleStream);
                        })
                        .then(done, done);
                });

            });

            describe("explore", function () {

                it("lists the content of a folder", function (done) {
                    gpf.fs.getFileStorage().explore(data)
                        .then(function (iEnumerator) {
                            assert(gpf.interfaces.isImplementedBy(gpf.interfaces.IEnumerator, iEnumerator));

                            function onInfo (info) {
                                var currentInfo = iEnumerator.getCurrent();
                                if (info.type === gpf.fs.types.file) {
                                    _checkFileBin(info);
                                    _checkFileBin(currentInfo);
                                } else {
                                    _checkFolder(info);
                                    _checkFolder(currentInfo);
                                }
                                return iEnumerator.moveNext();
                            }

                            return iEnumerator.reset()
                                .then(function () {
                                    return iEnumerator.moveNext();
                                })
                                .then(onInfo)
                                .then(onInfo)
                                .then(function (info) {
                                    assert(info === undefined);
                                })
                                .then(done, done);
                        });
                });

                it("fails on a file", function (done) {
                    gpf.fs.getFileStorage().explore(gpf.path.join(data, "file.bin"))
                        .then(function () {
                            done(new Error("unexpected"));
                        }, function () {
                            done();
                        });
                });

                it("fails with an invalid path", function (done) {
                    gpf.fs.getFileStorage().explore(gpf.path.join(data, "nothing"))
                        .then(function () {
                            done(new Error("unexpected"));
                        }, function () {
                            done();
                        });
                });

            });

        } else {

            it("does not return a file storage interface", function () {
                var iFileStorage = gpf.fs.getFileStorage();
                assert(null === iFileStorage);
            });

        }

    });

});
