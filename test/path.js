"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

describe("path", function () {

    var path = gpf.path;

    describe("gpf.path.join", function () {

        it("concatenates paths", function () {
            assert(path.join("abc/def", "ghi/jkl") === "abc/def/ghi/jkl");
        });

        it("handles trailing separator", function () {
            assert(path.join("abc/def/", "ghi/jkl/") === "abc/def/ghi/jkl");
        });

        it("handles relative paths", function () {
            assert(path.join("abc/def", "../ghi") === "abc/ghi");
        });

        it("handles multiple joins", function () {
            assert(path.join("abc", "def", "../ghi", "../jkl") === "abc/jkl");
        });

        it("resolves on known parent", function () {
            assert(path.join("abc", "../ghi") === "ghi");
        });

        it("does not resolve on unknown parent", function () {
            assert(path.join("abc", "../../ghi") === "");
        });

    });

    describe("gpf.path.parent", function () {

        it("retrieves the parent path", function () {
            assert(path.parent("abc/def") === "abc");
        });

        it("returns empty on a root", function () {
            assert(path.parent("/abc") === "");
        });

        it("returns empty when no parent", function () {
            assert(path.parent("abc") === "");
        });

    });

    var Func = Function, // Workaround for W054
        tests = [{
            label: "considers the last name of path",
            path: "abc/def.ghi",
            name: "def.ghi",
            nameOnly: "def",
            extension: ".ghi"
        }, {
            label: "handles trailing separator",
            path: "abc/def.ghi/",
            name: "def.ghi",
            nameOnly: "def",
            extension: ".ghi"
        }, {
            label: "handles trailing separator (no extension)",
            path: "abc/def/",
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
        }];

    function buildTestFunc (source) {
        return new Func ("assert(gpf.path." + source + ");");
    }

    describe("gpf.path.name", function () {

        tests.forEach(function (item) {
            it(item.label, buildTestFunc("name(\"" + item.path + "\") === \"" + item.name + "\""));
        });

    });

    describe("gpf.path.nameOnly", function () {

        tests.forEach(function (item) {
            it(item.label, buildTestFunc("nameOnly(\"" + item.path + "\") === \"" + item.nameOnly + "\""));
        });

    });

    describe("gpf.path.extension", function () {

        tests.forEach(function (item) {
            it(item.label, buildTestFunc("extension(\"" + item.path + "\") === \"" + item.extension + "\""));
        });

    });

    describe("gpf.path.relative", function () {

        it("solves the relative path", function () {
            assert(path.relative("abc/def", "abc/ghi") === "../ghi");
        });

        it("handles trailing separator", function () {
            assert(path.relative("abc/def/", "abc/ghi") === "../ghi");
        });

        it("works on non matching roots", function () {
            assert(path.relative("abc/def", "ghi/jkl") === "../../ghi/jkl");
        });

        it("works on non matching roots (any level)", function () {
            assert(path.relative("a/bc/def", "g/h/i/jkl") === "../../../g/h/i/jkl");
        });

    });

});
