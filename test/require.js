"use strict";

describe("require", function () {

    var basePath;

    before(function () {
        if (0 === config.httpPort) {
            // published version
            basePath = "/gpf/test-resources/require";
        } else {
            basePath = "/test/require";
        }
        gpf.require.configure({
            base: basePath
        });
    });

    describe("gpf.require.resolve", function () {

        it("resolves relative path", function () {
            assert(gpf.require.resolve("file.js") === basePath + "/file.js");
        });

        it("resolves relative path with folders", function () {
            assert(gpf.require.resolve("folder/file.js") === basePath + "/folder/file.js");
        });

        it("resolves relative path with folders (use of ..)", function () {
            assert(gpf.require.resolve("../file.js") === basePath.split("/").slice(0, -1).join("/") + "/file.js");
        });

    });

    describe("gpf.require.configure", function () {

        it("fails on invalid options", function () {
            var exceptionCaught;
            try {
                gpf.require.configure({
                    unknown: true
                });
            } catch (e) {
                exceptionCaught = e;
            }
            assert(exceptionCaught instanceof gpf.Error.InvalidRequireConfigureOption);
        });

    });

    describe("gpf.require.define", function () {

        function validateData (data) {
            assert("object" === typeof data);
            assert("value" === data.member);
        }

        function validateModule (module, type, dataExpected) {
            assert("object" === typeof module);
            assert(type === module.type);
            if (dataExpected) {
                validateData(module.data);
            }
        }

        describe("Asynchronous loading", function () {

            beforeEach(function () {
                gpf.require.configure({
                    clearCache: true
                });
            });

            it("loads JSON file as an object", function (done) {
                gpf.require.define({
                    data: "data.json"
                }, function (require) {
                    try {
                        validateData(require.data);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

            it("supports CommonJS format (static requires)", function (done) {
                gpf.require.define({
                    commonjs: "commonjs.js"
                }, function (require) {
                    try {
                        validateModule(require.commonjs, "commonjs", true);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

            it("doesn't supports CommonJS format with static and dynamic requires", function (done) {
                gpf.require.define({
                    commonjs: "mixed_commonjs.js"
                }).then(function () {
                    done(new Error("Should not happen"));
                }, function (reason) {
                    try {
                        assert(reason instanceof gpf.Error.NoCommonJSDynamicRequire);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

            it("doesn't supports CommonJS format with only dynamic requires", function (done) {
                gpf.require.define({
                    commonjs: "dynamic_commonjs.js"
                }).then(function () {
                    done(new Error("Should not happen"));
                }, function (reason) {
                    try {
                        assert(reason instanceof gpf.Error.NoCommonJSDynamicRequire);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

            it("supports AMD format (named with factory)", function (done) {
                gpf.require.define({
                    amd: "amd.js"
                }, function (require) {
                    try {
                        validateModule(require.amd, "amd", true);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

            it("supports AMD format (no name)", function (done) {
                gpf.require.define({
                    amd: "anonymous_amd.js"
                }, function (require) {
                    try {
                        validateModule(require.amd, "amd", false);
                        assert("" === require.amd.name);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

            it("supports AMD format (anonymous static)", function (done) {
                gpf.require.define({
                    amd: "static_amd.js"
                }, function (require) {
                    try {
                        validateModule(require.amd, "amd", false);
                        assert("static" === require.amd.name);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

            it("supports GPF modules (gpf is defined)", function (done) {
                gpf.require.define({
                    gpf: "gpf.js"
                }, function (require) {
                    try {
                        validateModule(require.gpf, "gpf", true);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

            it("supports GPF modules without constant value", function (done) {
                gpf.require.define({
                    constants: "constants.js"
                }, function (require) {
                    try {
                        assert(require.constants.hello === "World!");
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

            it("supports JavaScript file (no result)", function (done) {
                gpf.context().test = {};
                gpf.require.define({
                    js: "empty.js"
                }, function (require) {
                    try {
                        assert(require.js === undefined);
                        assert(gpf.context().test.empty);
                        done();
                    } catch (e) {
                        done(e);
                    } finally {
                        delete gpf.context().test;
                    }
                });
            });

            it("supports text file (no processor)", function (done) {
                gpf.require.define({
                    text: "../data/folder/hello world.txt"
                }, function (require) {
                    try {
                        assert(require.text === "hello world\n");
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

        });

        describe("Recursive loading", function () {

            beforeEach(function () {
                gpf.require.configure({
                    clearCache: true
                });
            });

            it("loads everything recursively", function (done) {
                gpf.require.define({
                    all: "folder/all.js"
                }, function (require) {
                    try {
                        validateModule(require.all.amd, "amd", true);
                        validateModule(require.all.commonjs, "commonjs", true);
                        validateData(require.all.data);
                        validateModule(require.all.gpf, "gpf", true);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

        });

        describe("Error handling", function () {

            it("fails if resource does not exist", function (done) {
                gpf.require.define({
                    notFound: "notFound.js"
                }).then(function () {
                    done(new Error("Should not happen"));
                }, function (reason) {
                    try {
                        assert(reason instanceof Error);
                        assert(reason.message !== "Should not happen");
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

            it("fails if one javascript resource fails", function (done) {
                gpf.require.define({
                    error: "error.js"
                }).then(function () {
                    done(new Error("Should not happen"));
                }, function (reason) {
                    try {
                        assert(reason instanceof Error);
                        assert(reason.message === "FAIL!");
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

        });
    });

    describe("caching", function () {

        beforeEach(function () {
            gpf.require.configure({
                clearCache: true
            });
        });

        describe("caching of loaded parts", function () {

            var additional = {};

            beforeEach(function (done) {
                gpf.require.define({
                    data: "data.json"
                }, function (require) {
                    try {
                        require.data.additional = additional;
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

            it("keeps modified objects", function (done) {
                gpf.require.define({
                    data: "data.json"
                }, function (require) {
                    try {
                        assert(additional === require.data.additional);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

        });

        describe("cache injection", function () {

            var mocked = {};

            beforeEach(function () {
                var cache = {};
                cache[gpf.require.resolve("data.json")] = mocked;
                gpf.require.configure({
                    clearCache: true,
                    cache: cache
                });
            });

            it("keeps injected objects", function (done) {
                gpf.require.define({
                    data: "data.json"
                }, function (require) {
                    try {
                        assert(mocked === require.data);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

        });

    });

});
