"use strict";

describe("fs", function () {

    describe("gpf.fs.getFileStorage", function () {

        if (gpf.hosts.unknown === gpf.host()) {

            it("returns a file storage interface", function () {
                var iFileStorage = gpf.fs.getFileStorage();
                assert(gpf.interfaces.isImplementedBy(gpf.interfaces.IFileStorage, iFileStorage));
            });

            it("can get file information", function (done) {
                var iFileStorage = gpf.fs.getFileStorage();
                iFileStorage.getInfo("test/data/file.bin")
                    .then(function (info) {
                        try {
                            assert(info.type === gpf.fs.types.file);
                            assert(info.fileName === "file.bin");
                            assert(info.filefilePath.indexOf("test/data/file.bin") !== -1);
                            assert(info.size === 256);
                            assert(info.createdDateTime instanceof Date);
                            assert(info.createdDateTime.getUTCFullYear() > 2010);
                            assert(info.modifiedDateTime instanceof Date);
                            assert(info.modifiedDateTime.getUTCFullYear() > 2010);

                        } catch (e) {
                            done(e);
                        }
                        done();

                    }, function (error) {
                        done(error);
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
