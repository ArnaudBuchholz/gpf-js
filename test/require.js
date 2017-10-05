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

        it("resolves relative path with folders", function () {
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

        describe("Synchronous loading", function () {

            beforeEach(function () {
                gpf.require.configure({
                    clearCache: true
                });
            });

            it("loads JSON file as an object", function () {
                validateData(gpf.require("data.json"));
            });

            it("supports CommonJS format", function () {
                validateModule(gpf.require("commonjs.js"), "commonjs", true);
            });

            it("supports AMD format (named with factory)", function () {
                validateModule(gpf.require("amd.js"), "amd", true);
            });

            it("supports AMD format (anonymous static)", function () {
                var amd = gpf.require("anonymous_amd.js");
                validateModule(amd, "amd", false);
                assert("anonymous" === amd.name);
            });

            it("supports GPF modules (gpf is defined)", function () {
                var amd = gpf.require("gpf.js");
                validateModule(amd, "gpf", true);
            });

        });

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

        describe("Complex case", function () {

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

    });

    describe("caching", function () {

        beforeEach(function () {
            gpf.require.configure({
                clearCache: true
            });
        });

        describe("caching of loaded parts", function () {

            var additional = {};

            beforeEach(function () {
                var data = gpf.require("data.json");
                data.additional = additional;
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
