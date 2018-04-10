"use strict";

describe("path", function () {

    var path = gpf.path;

    function generateTests (separator) {

        var escapedSeparator;
        if (separator === "/") {
            escapedSeparator = separator;
        } else {
            escapedSeparator = "\\\\";
        }

        describe("gpf.path.join (" + separator + ")", function () {

            var join;
            if (separator === "/") {
                join = path.join;
            } else {
                join = function () {
                    var args = Array.from(arguments, function (value) {
                        return value.split("/").join(separator);
                    });
                    return path.join.apply(path, args);
                };
            }

            it("concatenates paths", function () {
                assert(join("abc/def", "ghi/jkl") === "abc/def/ghi/jkl");
            });

            it("handles trailing separator", function () {
                assert(join("abc/def/", "ghi/jkl/") === "abc/def/ghi/jkl");
            });

            it("handles relative paths", function () {
                assert(join("abc/def", "../ghi") === "abc/ghi");
            });

            it("handles multiple joins", function () {
                assert(join("abc", "def", "../ghi/jkl", "../jkl") === "abc/ghi/jkl");
            });

            it("resolves on known parent", function () {
                assert(join("abc", "../ghi") === "ghi");
            });

            it("goes up with ..", function () {
                assert(join("abc/def", "..") === "abc");
            });

            it("does not resolve on unknown parent", function () {
                var exceptionCaught;
                try {
                    join("abc", "../../ghi");
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.UnreachablePath);
            });

            it("restarts on root path", function () {
                assert(join("abc/def", "/ghi") === "/ghi");
            });

            it("restarts on root path (last)", function () {
                assert(join("abc", "def", "/ghi") === "/ghi");
            });

            it("restarts on root path (middle)", function () {
                assert(join("abc", "/def", "ghi") === "/def/ghi");
            });

        });

        describe("gpf.path.parent (" + separator + ")", function () {

            it("retrieves the parent path", function () {
                assert(path.parent("abc" + separator + "def") === "abc");
            });

            it("returns empty on a root", function () {
                assert(path.parent(separator + "abc") === "");
            });

            it("returns empty when no parent", function () {
                assert(path.parent("abc") === "");
            });

            it("fails when empty", function () {
                var exceptionCaught;
                try {
                    path.parent("");
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.UnreachablePath);
            });

        });

        var Func = Function, // Workaround for W054
            tests = [{
                label: "considers the last name of path",
                path: "abc" + escapedSeparator + "def.ghi",
                name: "def.ghi",
                nameOnly: "def",
                extension: ".ghi"
            }, {
                label: "handles trailing separator",
                path: "abc" + escapedSeparator + "def.ghi" + escapedSeparator,
                name: "def.ghi",
                nameOnly: "def",
                extension: ".ghi"
            }, {
                label: "handles trailing separator (no extension)",
                path: "abc" + escapedSeparator + "def" + escapedSeparator,
                name: "def",
                nameOnly: "def",
                extension: ""
            }, {
                label: "handles name only",
                path: "abc.defgh",
                name: "abc.defgh",
                nameOnly: "abc",
                extension: ".defgh"
            }, {
                label: "handles name only (no extension)",
                path: "abc",
                name: "abc",
                nameOnly: "abc",
                extension: ""
            }, {
                label: "handles root",
                path: "/",
                name: "",
                nameOnly: "",
                extension: ""
            }, {
                label: "handles empty path",
                path: "",
                name: "",
                nameOnly: "",
                extension: ""
            }];

        function buildTestFunc (source) {
            return new Func("assert(gpf.path." + source + ");");
        }

        describe("gpf.path.name (" + separator + ")", function () {

            tests.forEach(function (item) {
                it(item.label, buildTestFunc("name(\"" + item.path + "\") === \"" + item.name + "\""));
            });

        });

        describe("gpf.path.nameOnly (" + separator + ")", function () {

            tests.forEach(function (item) {
                it(item.label, buildTestFunc("nameOnly(\"" + item.path + "\") === \"" + item.nameOnly + "\""));
            });

        });

        describe("gpf.path.extension (" + separator + ")", function () {

            tests.forEach(function (item) {
                it(item.label, buildTestFunc("extension(\"" + item.path + "\") === \"" + item.extension + "\""));
            });

        });

        describe("gpf.path.relative (" + separator + ")", function () {

            var relative;
            if (separator === "/") {
                relative = path.relative;
            } else {
                relative = function () {
                    var args = Array.from(arguments, function (value) {
                        return value.split("/").join(separator);
                    });
                    return path.relative.apply(path, args);
                };
            }

            it("solves the relative path", function () {
                assert(relative("abc/def", "abc/ghi") === "../ghi");
            });

            it("handles trailing separator", function () {
                assert(relative("abc/def/", "abc/ghi") === "../ghi");
            });

            it("works on non matching roots", function () {
                assert(relative("abc/def", "ghi/jkl") === "../../ghi/jkl");
            });

            it("works on non matching roots (any level)", function () {
                assert(relative("a/bc/def", "g/h/i/jkl") === "../../../g/h/i/jkl");
            });


            it("handles edge cases (left empty)", function () {
                assert(relative("", "abc/ghi") === "abc/ghi");
            });

            it("handles edge cases (right empty)", function () {
                assert(relative("abc/ghi", "") === "../..");
            });

            it("handles edge cases (both empty)", function () {
                assert(relative("", "") === "");
            });

        });

    }

    generateTests("/");
    generateTests("\\");

    if (gpf.internals) {

        describe("(internal)", function () {

            describe("_gpfPathNormalize", function () {

                var tests = {
                    "a/": "a",
                    "/a/": "/a",
                    "a/b": "a/b",
                    "a\\b": "a/b",
                    "a\\": "a",
                    "\\a\\": "/a"
                };

                gpf.internals._gpfObjectForEach(tests, function (expected, value) {

                    it("transforms \"" + value + "\" into \"" + expected + "\"", function () {
                        assert(expected === gpf.internals._gpfPathNormalize(value));
                    });

                });

            });

        });

    }

});
