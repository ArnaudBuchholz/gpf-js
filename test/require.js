"use strict";

describe("require", function () {

    before(function () {
        gpf.require.configure({
            base: "/test/require"
        });
    });

    describe("gpf.require.resolve", function () {

        it("resolves relative path", function () {
            assert(gpf.require.resolve("file.js") === "/test/require/file.js");
        });

        it("resolves relative path with folders", function () {
            assert(gpf.require.resolve("folder/file.js") === "/test/require/folder/file.js");
        });

        it("resolves relative path with folders (use of ..)", function () {
            assert(gpf.require.resolve("../file.js") === "/test/file.js");
        });

    });

    describe("gpf.require", function () {

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
                gpf.require({
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

            it("supports CommonJS format", function (done) {
                gpf.require({
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

            it("supports AMD format (named with factory)", function (done) {
                gpf.require({
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

            it("supports AMD format (anonymous static)", function (done) {
                gpf.require({
                    amd: "anonymous_amd.js"
                }, function (require) {
                    try {
                        validateModule(require.amd, "amd", false);
                        assert("anonymous" === require.amd.name);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

            it("supports GPF modules (gpf is defined)", function (done) {
                gpf.require({
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

        });

        describe("Recursive loading", function () {

            beforeEach(function () {
                gpf.require.configure({
                    clearCache: true
                });
            });

            it("loads everything recursively", function (done) {
                gpf.require({
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
                gpf.require({
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
                gpf.require({
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
                gpf.require({
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
                gpf.require({
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
                gpf.require({
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
