"use strict";

describe("read", function () {

    var data = config.testPath + "data";

    describe("gpf.read", function () {

        it("gives a generic read access to the file system", function (done) {
            gpf.read(gpf.path.join(data, "folder/hello world.txt"))
                .then(function (content) {
                    try {
                        assert(content === "hello world\n");
                        done();
                    } catch (e) {
                        done(e);
                    }
                }, done);
        });

        it("fails if the file does not exist", function (done) {
            gpf.read(gpf.path.join(data, "nope"))
                .then(function () {
                    done(new Error("Should not happen"));

                }, function (reason) {
                    try {
                        assert(reason instanceof Error);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
        });

    });

});
