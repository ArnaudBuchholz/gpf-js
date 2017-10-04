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
                gpf.require.cache = {};
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

        });

        describe("Asynchronous loading", function () {

            beforeEach(function () {
                gpf.require.cache = {};
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
        });


        it("handles gpf.require modules", function (done) {
            gpf.require({
                test: "gpf.js"
            }, function (require) {
                try {
                    assert("object" === typeof require.test);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it("caches loaded parts", function (done) {
            gpf.require({
                data: "data.json"
            }, function (require) {
                require.data.additional = true;
                gpf.require({
                    data2: "data.json"
                }, function (cachedRequire) {
                    try {
                        assert(true === cachedRequire.data2.additional);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });
        });

    });

    describe("gpf.require.cache", function () {

        it("allows injection", function (done) {
            var fakeData = {
                member: "value2"
            };
            gpf.require.cache[gpf.require.resolve("data.json")] = fakeData;
            gpf.require({
                data: "data.json"
            }, function (require) {
                try {
                    assert(fakeData === require.data);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

    });

});
