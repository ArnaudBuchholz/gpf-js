"use strict";
/*global describe, it, assert*/

describe("csv", function () {

    describe("gpf.csv.parse", function () {

        it("reads a CSV file", function () {
            var records = gpf.csv.parse([
                "LINE;VALUE",
                "0;ABC",
                "1;DEF"
            ].join("\r\n"));
            assert(2 === records.length);
            assert("0" === records[0].LINE);
            assert("ABC" === records[0].VALUE);
            assert("1" === records[1].LINE);
            assert("DEF" === records[1].VALUE);
        });

        it("supports value quoting", function () {
            var records = gpf.csv.parse([
                "LINE;VALUE",
                "0;\"ABC\"",
                "1;DEF",
                "2;GH\"I",
                "3;\"JK\"\"L\"",
                "4;\"MN",
                "O\""
            ].join("\r\n"));
            assert(5 === records.length);
            assert("0" === records[0].LINE);
            assert("ABC" === records[0].VALUE);
            assert("1" === records[1].LINE);
            assert("DEF" === records[1].VALUE);
            assert("2" === records[2].LINE);
            assert("GH\"I" === records[2].VALUE);
            assert("3" === records[3].LINE);
            assert("JK\"L" === records[3].VALUE);
            assert("4" === records[4].LINE);
            assert("MN\r\nO" === records[4].VALUE);
        });

        it("supports quoting the separator as well", function () {
            var records = gpf.csv.parse([
                "LINE;VALUE",
                "0;\"A;BC\""
            ].join("\r\n"));
            assert(1 === records.length);
            assert("0" === records[0].LINE);
            assert("A;BC" === records[0].VALUE);
        });

        it("supports header being specified as an option", function () {
            var records = gpf.csv.parse([
                "0;ABC",
                "1;DEF"
            ].join("\r\n"), {
                header: "LINE;VALUE"
            });
            assert(2 === records.length);
            assert("0" === records[0].LINE);
            assert("ABC" === records[0].VALUE);
            assert("1" === records[1].LINE);
            assert("DEF" === records[1].VALUE);
        });

    });

});
