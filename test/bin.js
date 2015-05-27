"use strict";
/*global describe, it, assert*/

describe("bin", function () {

    describe("gpf.bin.pow", function () {

        it("gives the powers of 2", function () {
            assert(gpf.bin.pow2(0) ===  1);
            assert(gpf.bin.pow2(1) ===  2);
            assert(gpf.bin.pow2(2) ===  4);
            assert(gpf.bin.pow2(3) ===  8);
            assert(gpf.bin.pow2(4) ===  16);
            assert(gpf.bin.pow2(5) ===  32);
            assert(gpf.bin.pow2(6) ===  64);
            assert(gpf.bin.pow2(7) ===  128);
            assert(gpf.bin.pow2(8) ===  256);
            assert(gpf.bin.pow2(9) ===  512);
            assert(gpf.bin.pow2(10) ===  1024);
            assert(gpf.bin.pow2(11) ===  2048);
            assert(gpf.bin.pow2(12) ===  4096);
            assert(gpf.bin.pow2(13) ===  8192);
            assert(gpf.bin.pow2(14) ===  16384);
            assert(gpf.bin.pow2(15) ===  32768);
            assert(gpf.bin.pow2(16) ===  65536);
            assert(gpf.bin.pow2(31) ===  2147483648);
            assert(gpf.bin.pow2(32) ===  4294967296);
        });

        it("checks if a number is a power of 2", function () {
            assert(gpf.bin.isPow2(0) ===  -1);
            assert(gpf.bin.isPow2(1) ===  0);
            assert(gpf.bin.isPow2(2) ===  1);
            assert(gpf.bin.isPow2(4) ===  2);
            assert(gpf.bin.isPow2(8) ===  3);
            assert(gpf.bin.isPow2(16) ===  4);
            assert(gpf.bin.isPow2(32) ===  5);
            assert(gpf.bin.isPow2(64) ===  6);
            assert(gpf.bin.isPow2(128) ===  7);
            assert(gpf.bin.isPow2(256) ===  8);
            assert(gpf.bin.isPow2(512) ===  9);
            assert(gpf.bin.isPow2(1024) ===  10);
            assert(gpf.bin.isPow2(2048) ===  11);
            assert(gpf.bin.isPow2(4096) ===  12);
            assert(gpf.bin.isPow2(8192) ===  13);
            assert(gpf.bin.isPow2(16384) ===  14);
            assert(gpf.bin.isPow2(32768) ===  15);
            assert(gpf.bin.isPow2(32748) ===  -1);
            assert(gpf.bin.isPow2(65536) ===  16);
            assert(gpf.bin.isPow2(65534) ===  -1);
            assert(gpf.bin.isPow2(2147483648) === 31);
            assert(gpf.bin.isPow2(4294967296) === 32);
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