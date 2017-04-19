"use strict";

describe("fs/node", function () {

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

    }

});
