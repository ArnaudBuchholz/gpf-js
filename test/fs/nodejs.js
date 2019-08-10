"use strict";

describe("fs/node", function () {

    if (config.performance) {
        it("is not relevant for performance testing", function () {
            assert(true);
        });
        return;
    }

    if (gpf.hosts.nodejs === gpf.host()) {

        it("forwards inner errors (generic API)", function (done) {
            gpf.fs.getFileStorage().deleteFile("test/data/notFound.bin")
                .then(function () {
                    throw new Error("Should fail");
                }, function (err) {
                    assert(err.code === "ENOENT");
                    done();
                })["catch"](function (e) {
                    done(e);
                });
        });

        if (gpf.internals) {
            var _gpfFsNodeGetType = gpf.internals._gpfFsNodeGetType;

            it("uses unknown file type if not file or directory", function () {
                assert(gpf.fs.types.unknown === _gpfFsNodeGetType({
                    isDirectory: function () {
                        return false;
                    },
                    isFile: function () {
                        return false;
                    }
                }));
            });
        }

    }

});
