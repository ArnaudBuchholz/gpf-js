"use strict";
/*global describe, it, assert*/

describe("bin", function () {

    var verifiedPows = [
        1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536,
        131072, 262144, 524288, 1048576, 2097152, 4194304, 8388608, 16777216,
        33554432, 67108864, 134217728, 268435456, 536870912, 1073741824, 2147483648, 4294967296
    ];

    describe("gpf.bin.pow", function () {

        it("gives the powers of 2", function () {
            verifiedPows.forEach(function (value, index) {
                assert(gpf.bin.pow2(index) ===  value);
            });
        });

        it("checks if a number is a power of 2", function () {
            [
                0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 32748, 65536, 65534,
                2147483648, 4294967296
            ].forEach(function (value) {
                var fromVerifiedPos = verifiedPows.indexOf(value);
                assert(gpf.bin.isPow2(value) ===  fromVerifiedPos);
            });
        });

    });

    describe("gpf.bin.toAny", function () {

        describe("gpf.bin.toHexa", function () {

            it("converts a number to its hexadecimal value", function () {
                assert(gpf.bin.toHexa(2882400152) === "ABCDEF98");
            });

            it("truncates the value if necessary", function () {
                assert(gpf.bin.toHexa(2882400152, 4) === "EF98");
            });

            it("pads the value if necessary", function () {
                assert(gpf.bin.toHexa(2882400152, 10) === "00ABCDEF98");
            });

            it("handles negative numbers", function () {
                assert(gpf.bin.toHexa(-1, 8) === "FFFFFFFF");
            });

        });

        describe("gpf.bin.toBase64", function () {

            it("converts a number to its base64 value", function () {
                assert(gpf.bin.toBase64(2882400152) === "Crze+Y");
            });

            it("supports configurable padding", function () {
                assert(gpf.bin.toBase64(2882400152, 8, "=") === "==Crze+Y");
            });

        });

    });

    describe("gpf.bin.fromAny", function () {

        describe("gpf.bin.fromHexa", function () {

            it("converts an hexadecimal value to a number", function () {
                assert(gpf.bin.fromHexa("ABCDEF98", "0") === 2882400152);
            });

            it("supports padding", function () {
                assert(gpf.bin.fromHexa("00ABCDEF98") === 2882400152);
            });

        });

        describe("gpf.bin.fromBase64", function () {

            it("converts a base64 value to a number", function () {
                assert(gpf.bin.fromBase64("Crze+Y") === 2882400152);
            });

            it("supports configurable padding", function () {
                assert(gpf.bin.fromBase64("==Crze+Y", "=") === 2882400152);
            });

        });

    });

    describe("Binary values manipulation", function () {

        var
            pow2 = gpf.bin.pow2(2),
            pow3 = gpf.bin.pow2(3),
            pow4 = gpf.bin.pow2(4);

        describe("gpf.bin.test", function () {

            it("tests bits in a value", function () {
                assert(true === gpf.bin.test(pow4, pow4));
                assert(false === gpf.bin.test(pow3, pow4));
                assert(true === gpf.bin.test(255, pow2));
                assert(true === gpf.bin.test(255, pow2 + pow3));
            });

        });

        describe("gpf.bin.clear", function () {

            it("clears bits in a value", function () {
                assert(pow4 === gpf.bin.clear(pow4 + pow3, pow3));
            });

        });

    });

    describe("gpf.bin.random", function () {

        it("generate random values between 0 and 2^32", function () {
            var values = [],
                value,
                max32 = gpf.bin.pow2(32);
            while (values.length < 1000) {
                value = gpf.bin.random();
                assert(0 <= value);
                assert(value < max32);
                assert(-1 === values.indexOf(value));
                values.push(value);
            }
        });

    });

});
