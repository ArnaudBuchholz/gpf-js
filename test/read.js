"use strict";

describe("read", function () {

    var data;

    before(function () {
        if (gpf.host() === gpf.hosts.browser) {
            if (0 === config.httpPort) {
                // published version
                data = "/gpf/test-resources/data";
            } else {
                // local version
                data = "/test/data";
            }
        } else {
            // Execution path is always the root folder of the project
            data = "test/data";
        }
    });

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
