"use strict";

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

describe("fs", function () {

    describe("gpf.fs.getFileStorage", function () {

        if (gpf.hosts.nodejs === gpf.host()) {

            var data = "test/data",
                tmp = "tmp/fs/" + gpf.host() + "/"
                    + (new Date()).toISOString().replace(/\-|T|\:|\.|Z/g, "")
                    + "/" + Math.floor(100 * Math.random());

            it("returns a file storage interface", function () {
                assert(gpf.interfaces.isImplementedBy(gpf.interfaces.IFileStorage, gpf.fs.getFileStorage()));
            });

            describe("getInfo", function () {

                it("can get file information", function (done) {
                    gpf.fs.getFileStorage().getInfo(gpf.path.join(data, "file.bin"))
                        .then(function (info) {
                            var exceptionCaught;
                            try {
                                assert(info.type === gpf.fs.types.file);
                                assert(info.fileName === "file.bin");
                                assert(info.filePath.indexOf(data + "/file.bin") !== -1);
                                assert(info.size === 256);
                                assert(info.createdDateTime instanceof Date);
                                assert(info.createdDateTime.getUTCFullYear() > 2010);
                                assert(info.modifiedDateTime instanceof Date);
                                assert(info.modifiedDateTime.getUTCFullYear() > 2010);

                            } catch (e) {
                                exceptionCaught = e;
                            }
                            done(exceptionCaught);

                        }, function (error) {
                            done(error);
                        });
                });

                it("can get directory information", function (done) {
                    gpf.fs.getFileStorage().getInfo(gpf.path.join(data, "folder"))
                        .then(function (info) {
                            var exceptionCaught;
                            try {
                                assert(info.type === gpf.fs.types.directory);
                                assert(info.fileName === "folder");
                                assert(info.filePath.indexOf(data + "/folder") !== -1);
                                assert(info.createdDateTime instanceof Date);
                                assert(info.createdDateTime.getUTCFullYear() > 2010);
                                assert(info.modifiedDateTime instanceof Date);
                                assert(info.modifiedDateTime.getUTCFullYear() > 2010);

                            } catch (e) {
                                exceptionCaught = e;
                            }
                            done(exceptionCaught);

                        }, function (error) {
                            done(error);
                        });
                });

                it("does not fail if the file does not exist", function (done) {
                    gpf.fs.getFileStorage().getInfo(gpf.path.join(data, "nope"))
                        .then(function (info) {
                            var exceptionCaught;
                            try {
                                assert(info.type === gpf.fs.types.notFound);

                            } catch (e) {
                                exceptionCaught = e;
                            }
                            done(exceptionCaught);

                        }, function (error) {
                            done(error);
                        });
                });

            });

            describe("openTextStream", function () {

                function _read (path) {
                    var iFileStorage = gpf.fs.getFileStorage(),
                        iWritableStream = new gpf.stream.WritableString();
                    return iFileStorage.openTextStream(path, gpf.fs.openFor.reading)
                        .then(function (iReadableStream) {
                            assert(gpf.interfaces.isImplementedBy(gpf.interfaces.IReadableStream, iReadableStream));
                            return iReadableStream.read(iWritableStream)
                                .then(function () {
                                    assert(iWritableStream.toString() === "hello world\n");
                                    return iFileStorage.close(iReadableStream);
                                });
                        });
                }

                describe("read", function () {

                    it("reads a text file", function (done) {
                        _read(gpf.path.join(data, "folder/hello world.txt"))
                            .then(done, done);
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

                    it("writes a text file", function (done) {
                        var filePath = gpf.path.join(tmp, "hello world.txt");
                        _write(filePath, "hello world\n")
                            .then(function () {
                                return _read(filePath);
                            })
                            .then(done, done);
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
