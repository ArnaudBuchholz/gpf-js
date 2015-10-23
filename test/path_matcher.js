"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

/*eslint-disable max-nested-callbacks*/

describe("path_matcher", function () {

    describe("gpf.path.match", function () {

        var
            match = gpf.path.match,
            compile = gpf.path.compileMatchPattern;

        it("matches simple file names", function () {
            assert(true === match("test.js", "test.js"));
            assert(false === match("test.js", "test.jsp"));
            assert(false === match("test.js", "new_test.js"));
        });

        it("matches simple pattern", function () {
            assert(true === match("*.js", "test.js"));
            assert(false === match("*.js", "test.jsp"));
            assert(false === match("*.txt", "test.js"));
        });

        it("matches negative pattern", function () {
            assert(false === match("!*.js", "test.js"));
            assert(true === match("!*.txt", "test.js"));
        });

        it("matches multiple patterns", function () {
            var compiledPattern = gpf.path.compileMatchPattern([
                "*.js",
                "*.txt"
            ]);
            assert(true === match(compiledPattern, "test.js"));
            assert(true === match(compiledPattern, "test.txt"));
        });

        it("matches patterns that includes folders", function () {
            var compiledPattern = compile([
                "src/*.js",
                "test/*.js"
            ]);
            assert(false === match(compiledPattern, "test.js"));
            assert(false === match(compiledPattern, "src/test.txt"));
            assert(true === match(compiledPattern, "src/test.js"));
            assert(false === match(compiledPattern, "src/test/test.js"));
            assert(false === match(compiledPattern, "test/test.bin"));
        });

        it("matches patterns that includes **", function () {
            var compiledPattern = compile([
                "src/**/*.js",
                "src/data/**/*.json"
            ]);
            assert(false === match(compiledPattern, "test.js"));
            assert(true === match(compiledPattern, "src/test.js"));
            assert(true === match(compiledPattern, "src/test/test.js"));
            assert(true === match(compiledPattern, "src/data/test.js"));
            assert(true === match(compiledPattern, "src/data/test.json"));
            assert(false === match(compiledPattern, "src/test/test.json"));
            assert(true === match(compiledPattern, "src/test/mocha/test.js"));
        });

        it("matches patterns that starts with **", function () {
            var compiledPattern = compile([
                "**/*.js",
                "**/data/*.json"
            ]);
            assert(true === match(compiledPattern, "test.js"));
            assert(true === match(compiledPattern, "src/test.js"));
            assert(true === match(compiledPattern, "src/test/test.js"));
            assert(false === match(compiledPattern, "test.json"));
            assert(false === match(compiledPattern, "src/test.json"));
            assert(true === match(compiledPattern, "src/data/test.json"));
        });

        it("matches patterns that ends with **", function () {
            var compiledPattern = compile([
                "src/**",
                "lib/data/**"
            ]);
            assert(false === match(compiledPattern, "test.js"));
            assert(true === match(compiledPattern, "src/test.js"));
            assert(true === match(compiledPattern, "src/test/test.js"));
            assert(false === match(compiledPattern, "lib/test.json"));
            assert(true === match(compiledPattern, "lib/data/test.json"));
        });

        it("handles absolute patterns", function () {
            assert(false === match("/test/rules/*.js", "test.js"));
            assert(true === match("/test/rules/*.js", "/test/rules/any.js"));
        });
    });

});
