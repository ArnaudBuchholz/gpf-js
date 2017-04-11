"use strict";

describe("fs", function () {

    describe("gpf.fs.getFileStorage", function () {

        if (gpf.hosts.nodejs === gpf.host()) {

            var root = "test/data";

            it("returns a file storage interface", function () {
                var iFileStorage = gpf.fs.getFileStorage();
                assert(gpf.interfaces.isImplementedBy(gpf.interfaces.IFileStorage, iFileStorage));
            });

            describe("getInfo", function () {

                it("can get file information", function (done) {
                    var iFileStorage = gpf.fs.getFileStorage();
                    iFileStorage.getInfo(gpf.path.join(root, "file.bin"))
                        .then(function (info) {
                            var exceptionCaught;
                            try {
                                assert(info.type === gpf.fs.types.file);
                                assert(info.fileName === "file.bin");
                                assert(info.filePath.indexOf(root + "/file.bin") !== -1);
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
                    iFileStorage.getInfo(gpf.path.join(root, "folder"))
                        .then(function (info) {
                            var exceptionCaught;
                            try {
                                assert(info.type === gpf.fs.types.directory);
                                assert(info.fileName === "folder");
                                assert(info.filePath.indexOf(root + "/folder") !== -1);
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
                    iFileStorage.getInfo(gpf.path.join(root, "nope"))
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

        } else {

            it("does not return a file storage interface", function () {
                var iFileStorage = gpf.fs.getFileStorage();
                assert(null === iFileStorage);
            });

        }

    });

});
