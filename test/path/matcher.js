"use strict";

describe("path/matcher", function () {

    describe("gpf.path.match", function () {

        var match = gpf.path.match,
            compile = gpf.path.compileMatchPattern;

        describe("file name", function () {

            it("recognizes the whole file name", function () {
                assert(true === match("test.js", "test.js"));
            });

            it("ignores partial file name (suffix)", function () {
                assert(false === match("test.js", "test.jsp"));
            });

            it("ignores partial file name (prefix)", function () {
                assert(false === match("test.js", "new_test.js"));
            });

        });

        describe("file name pattern", function () {

            it("recognizes the whole extension", function () {
                assert(true === match("*.js", "test.js"));
            });

            it("ignores partial extension", function () {
                assert(false === match("*.js", "test.jsp"));
            });

            it("ignores non matching extension", function () {
                assert(false === match("*.txt", "test.js"));
            });

            it("recognizes generic extension", function () {
                assert(true === match("*.js*", "test.jsp"));
            });

            it("recognizes the file names starting with", function () {
                assert(true === match("m*.js", "matcher.js"));
            });

            it("ignores the file names not starting with", function () {
                assert(false === match("m*.js", "path.js"));
            });

        });

        describe("negative pattern", function () {

            it("ignores a given extension", function () {
                assert(false === match("!*.js", "test.js"));
            });

            it("recognizes everything but a given extension", function () {
                assert(true === match("!*.text", "test.js"));
            });

        });

        describe("multiple patterns", function () {

            var compiledPattern = gpf.path.compileMatchPattern([
                "*.js",
                "*.txt"
            ]);

            it("recognizes all js files", function () {
                assert(true === match(compiledPattern, "test.js"));
            });

            it("recognizes all txt files", function () {
                assert(true === match(compiledPattern, "test.txt"));
            });

            it("ignores any other extension", function () {
                assert(false === match(compiledPattern, "test.jsp"));
            });

        });

        describe("patterns with folders", function () {

            var compiledPattern = compile([
                "src/*.js",
                "test/*.js"
            ]);

            it("ignores if folders are not matching", function () {
                assert(false === match(compiledPattern, "test.js"));
            });

            it("ignores if folders match but not the filename", function () {
                assert(false === match(compiledPattern, "src/test.txt"));
            });

            it("recognizes if folders and filename match", function () {
                assert(true === match(compiledPattern, "src/test.js"));
            });

            it("ignores if the folders depth does not match", function () {
                assert(false === match(compiledPattern, "src/test/test.js"));
            });

        });

        describe("generic folder pattern (**)", function () {

            describe("in the middle of the pattern", function () {

                var compiledPattern = compile([
                    "src/**/*.js",
                    "src/data/**/*.json"
                ]);

                it("matches patterns that includes **", function () {
                    assert(false === match(compiledPattern, "test.js"));
                    assert(true === match(compiledPattern, "src/test.js"));
                    assert(true === match(compiledPattern, "src/test/test.js"));
                    assert(true === match(compiledPattern, "src/data/test.js"));
                    assert(true === match(compiledPattern, "src/data/test.json"));
                    assert(false === match(compiledPattern, "src/test/test.json"));
                    assert(true === match(compiledPattern, "src/test/mocha/test.js"));
                });

            });

            describe("at the beginning of the pattern", function () {

                var compiledPattern = compile([
                    "**/*.js",
                    "**/data/*.json"
                ]);

                it("matches patterns that starts with **", function () {
                    assert(true === match(compiledPattern, "test.js"));
                    assert(true === match(compiledPattern, "src/test.js"));
                    assert(true === match(compiledPattern, "src/test/test.js"));
                    assert(false === match(compiledPattern, "test.json"));
                    assert(false === match(compiledPattern, "src/test.json"));
                    assert(true === match(compiledPattern, "src/data/test.json"));
                });

            });

            describe("at the end of the pattern", function () {

                var compiledPattern = compile([
                    "src/**",
                    "lib/data/**"
                ]);

                it("matches patterns that ends with **", function () {
                    assert(false === match(compiledPattern, "test.js"));
                    assert(true === match(compiledPattern, "src/test.js"));
                    assert(true === match(compiledPattern, "src/test/test.js"));
                    assert(false === match(compiledPattern, "lib/test.json"));
                    assert(true === match(compiledPattern, "lib/data/test.json"));
                });

            });

        });

        describe("absolute patterns", function () {

            it("handles absolute patterns", function () {
                assert(false === match("/test/rules/*.js", "test.js"));
                assert(true === match("/test/rules/*.js", "/test/rules/any.js"));
            });

        });

    });

});
