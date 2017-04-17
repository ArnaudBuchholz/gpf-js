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
console.log(subPath);
        return iFileStorage.getInfo(subPath)
            .then(function (info) {
                if (info.type === gpf.fs.types.directory) {
                    return processPart();
                }
                if (info.type === gpf.fs.types.notFound) {
                    return iFileStorage.createDirectory(path).then(processPart);
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
                tmp = "tmp/fs/" + gpf.host() + "/" + (new Date()).toISOString() + "/" + Math.floor(100 * Math.random());

            it("returns a file storage interface", function () {
                var iFileStorage = gpf.fs.getFileStorage();
                assert(gpf.interfaces.isImplementedBy(gpf.interfaces.IFileStorage, iFileStorage));
            });

            describe("getInfo", function () {

                it("can get file information", function (done) {
                    var iFileStorage = gpf.fs.getFileStorage();
                    iFileStorage.getInfo(gpf.path.join(data, "file.bin"))
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
                    var iFileStorage = gpf.fs.getFileStorage();
                    iFileStorage.getInfo(gpf.path.join(data, "folder"))
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
                    var iFileStorage = gpf.fs.getFileStorage();
                    iFileStorage.getInfo(gpf.path.join(data, "nope"))
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

            describe("openTextStream (read)", function () {

                it("reads a text file", function (done) {
                    var iFileStorage = gpf.fs.getFileStorage(),
                        iReadableStream = iFileStorage.openTextStream(gpf.path.join(data, "folder/hello world.txt"),
                            gpf.fs.openFor.reading),
                        iWritableStream = new gpf.stream.WritableString();
                    assert(gpf.interfaces.isImplementedBy(gpf.interfaces.IReadableStream, iReadableStream));
                    iReadableStream.read(iWritableStream)
                        .then(function () {
                            var exceptionCaught;
                            try {
                                assert(iWritableStream.toString() === "hello world\n");
                                iFileStorage.close(iReadableStream);
                            } catch (e) {
                                exceptionCaught = e;
                            }
                            done(exceptionCaught);
                        });
                });

            });

            describe("openTextStream (write)", function () {

                before(function (done) {
                    _createPath(tmp)
                        .then(function () {
                            done();
                        }, done);
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
