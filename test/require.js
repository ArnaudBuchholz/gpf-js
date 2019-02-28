"use strict";

describe("require", function () {

    var basePath = config.testPath + "require";

    before(function () {
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
            assert(typeof data === "object");
            assert(data.member === "value");
        }

        function validateModule (module, type, dataExpected) {
            assert(typeof module === "object");
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
                    validateData(require.data);
                }).then(done, done);
            });

            it("supports CommonJS format (static requires)", function (done) {
                gpf.require.define({
                    commonjs: "commonjs.js"
                }, function (require) {
                    validateModule(require.commonjs, "commonjs", true);
                }).then(done, done);
            });

            it("doesn't supports CommonJS format with static and dynamic requires", function (done) {
                gpf.require.define({
                    commonjs: "mixed_commonjs.js"
                }).then(function () {
                    done(new Error("Should not happen"));
                }, function (reason) {
                    assert(reason instanceof gpf.Error.NoCommonJSDynamicRequire);
                }).then(done, done);
            });

            it("supports independant CommonJS format (no require)", function (done) {
                gpf.require.define({
                    commonjs: "indep_commonjs.js"
                }, function (require) {
                    validateModule(require.commonjs, "indep_commonjs", true);
                }).then(done, done);
            });

            it("doesn't supports CommonJS format with only dynamic requires", function (done) {
                gpf.require.define({
                    commonjs: "dynamic_commonjs.js"
                }).then(function () {
                    done(new Error("Should not happen"));
                }, function (reason) {
                    assert(reason instanceof gpf.Error.NoCommonJSDynamicRequire);
                }).then(done, done);
            });

            it("supports AMD format (named with factory)", function (done) {
                gpf.require.define({
                    amd: "amd.js"
                }, function (require) {
                    validateModule(require.amd, "amd", true);
                }).then(done, done);
            });

            it("supports AMD format (no name)", function (done) {
                gpf.require.define({
                    amd: "anonymous_amd.js"
                }, function (require) {
                    validateModule(require.amd, "amd", false);
                    assert(require.amd.name === "");
                }).then(done, done);
            });

            it("supports AMD format (anonymous static)", function (done) {
                gpf.require.define({
                    amd: "static_amd.js"
                }, function (require) {
                    validateModule(require.amd, "amd", false);
                    assert(require.amd.name === "static");
                }).then(done, done);
            });

            it("supports GPF modules (gpf is defined)", function (done) {
                gpf.require.define({
                    gpf: "gpf.js"
                }, function (require) {
                    validateModule(require.gpf, "gpf", true);
                }).then(done, done);
            });

            it("supports GPF modules without constant value", function (done) {
                gpf.require.define({
                    constants: "constants.js"
                }, function (require) {
                    assert(require.constants.hello === "World!");
                }).then(done, done);
            });

            it("supports JavaScript file (no result)", function (done) {
                gpf.context().test = {};
                gpf.require.define({
                    js: "empty.js"
                }, function (require) {
                    try {
                        assert(require.js === undefined);
                        assert(gpf.context().test.empty);
                    } finally {
                        delete gpf.context().test;
                    }
                }).then(done, done);
            });

            it("supports text file (no processor)", function (done) {
                gpf.require.define({
                    text: "../data/folder/hello world.txt"
                }, function (require) {
                    assert(require.text === "hello world\n");
                }).then(done, done);
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
                    validateModule(require.all.amd, "amd", true);
                    validateModule(require.all.commonjs, "commonjs", true);
                    validateData(require.all.data);
                    validateModule(require.all.gpf, "gpf", true);
                }).then(done, done);
            });

        });

        describe("Error handling", function () {

            it("fails if resource does not exist", function (done) {
                gpf.require.define({
                    notFound: "notFound.js"
                }).then(function () {
                    done(new Error("Should not happen"));
                }, function (reason) {
                    assert(reason instanceof Error);
                    assert(reason.message !== "Should not happen");
                }).then(done, done);
            });

            it("fails if one javascript resource fails", function (done) {
                gpf.require.define({
                    error: "error.js"
                }).then(function () {
                    done(new Error("Should not happen"));
                }, function (reason) {
                    assert(reason instanceof Error);
                    assert(reason.message === "FAIL!");
                }).then(done, done);
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
                    require.data.additional = additional;
                }).then(done, done);
            });

            it("keeps modified objects", function (done) {
                gpf.require.define({
                    data: "data.json"
                }, function (require) {
                    assert(additional === require.data.additional);
                }).then(done, done);
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
                    assert(mocked === require.data);
                }).then(done, done);
            });

        });

        describe("error documentation", function () {

            function _checkRequires (reason, index, expected) {
                assert(reason instanceof Error);
                assert(Array.isArray(reason.requires));
                assert(reason.requires.length > index);
                assert(reason.requires[index].indexOf(expected) !== -1);
            }

            it("documents the failing resource name (missing json)", function (done) {
                gpf.require.define({
                    test: "notFound.json"
                }).then(function () {
                    return Promise.reject(0);
                })["catch"](function (reason) {
                    _checkRequires(reason, 0, "require/notFound.json");
                }).then(done, done);
            });

            it("documents the failing resource name (error in javascript)", function (done) {
                gpf.require.define({
                    test: "syntax_error.js"
                }).then(function () {
                    return Promise.reject(0);
                })["catch"](function (reason) {
                    _checkRequires(reason, 0, "require/syntax_error.js");
                }).then(done, done);
            });

            it("documents the loading stack", function (done) {
                gpf.require.define({
                    test: "error_stack.js"
                }).then(function () {
                    return Promise.reject(0);
                })["catch"](function (reason) {
                    try {
                        _checkRequires(reason, 0, "require/syntax_error.js");
                        _checkRequires(reason, 1, "require/error_stack.js");
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });

            if (typeof SyntaxError === "function") {

                it("transmits the native error", function (done) {
                    gpf.require.define({
                        test: "syntax_error.js"
                    }).then(function () {
                        return Promise.reject(0);
                    })["catch"](function (reason) {
                        try {
                            _checkRequires(reason, 0, "require/syntax_error.js");
                            assert(reason instanceof SyntaxError);
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
                });

            }

        });

    });

    describe("preloading", function () {

        function preloadTest () {
            gpf.require.define({
                data: "data.js"
            }, function (require) {
                return require.data;
            });
        }

        function preloadData () {
            module.exports = "Hello World!";
        }

        function _extract (container) {
            var source = container.toString(),
                from = source.indexOf("{"),
                to = source.lastIndexOf("}");
            return source.substring(from + 1, to);
        }

        beforeEach(function () {
            gpf.require.configure({
                clearCache: true,
                base: "",
                preload: {
                    "preload/test.js": _extract(preloadTest),
                    "preload/data.js": _extract(preloadData)
                }
            });
        });

        it("loads everything recursively", function (done) {
            gpf.require.define({
                result: "preload/test.js"
            }, function (require) {
                assert(require.result === "Hello World!");

            }).then(done, done);
        });

    });

    /*
    describe("preprocessing", function () {

        it("allows on the fly modification of a resource", function (done) {
            gpf.require.configure({
                clearCache: true,
                base: "",
                preprocess: function (resource) {
                    if (resource.name.endsWith("preprocess.ext")) {
                        assert(resource.content.startsWith("WILL BE REPLACED"));
                        assert(resource.type === ".ext");
                        resource.content = "module.exports = 'Hello World!';";
                        resource.type = ".js";
                    }
                }
            });

            gpf.require.define({
                result: "preprocess.ext"
            }, function (require) {
                assert(require.result === "Hello World!");
            }).then(done, done);
        });

    });
*/

});
