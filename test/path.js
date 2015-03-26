"use strict";
/*global describe, it, assert*/

describe("path", function () {

    describe("gpf.path.match", function () {

        it("matches simple file names", function () {
            assert(true === gpf.path.match("*.js", "test.js"));
            assert(false === gpf.path.match("*.txt", "test.js"));
        });

        it("doesn't match negative pattern", function () {
            assert(false === gpf.path.match("!*.js", "test.js"));
            assert(true === gpf.path.match("!*.txt", "test.js"));
        });

        it("matches using multiple patterns", function () {
            assert(true === gpf.path.match(["*.js", "*.txt"], "test.js"));
            assert(true === gpf.path.match(["*.js", "*.txt"], "test.txt"));
        });

    });

});