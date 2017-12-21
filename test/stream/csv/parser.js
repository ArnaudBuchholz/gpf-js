"use strict";

describe("stream/csv/parser", function () {

    describe("gpf.stream.csv.Parser", function () {

        function _pipe (params) {
            var iReadableArray = new gpf.stream.ReadableArray(params.lines),
                iWritableArray = new gpf.stream.WritableArray();
            return gpf.stream.pipe(iReadableArray, params.parser, iWritableArray)
                .then(function () {
                    return iWritableArray.toArray();
                });
        }

        function _process (params, done) {
            _pipe(params).then(function (records) {
                assert(records.length === params.expected.length);
                records.forEach(function (record, index) {
                    var expected = params.expected[index],
                        keys = Object.keys(record);
                    assert(keys.join(",") === Object.keys(expected).join(","));
                    keys.forEach(function (key) {
                        assert(record[key] === expected[key]);
                    });
                });
                done();
            })["catch"](done);
        }

        it("reads a one-column CSV file", function (done) {
            _process({
                lines: ["LINE", "0", "1"],
                parser: new gpf.stream.csv.Parser(),
                expected: [{
                    LINE: "0"
                }, {
                    LINE: "1"
                }]
            }, done);
        });

        it("reads a CSV file", function (done) {
            _process({
                lines: ["LINE;VALUE", "0;ABC", "1;DEF"],
                parser: new gpf.stream.csv.Parser(),
                expected: [{
                    LINE: "0",
                    VALUE: "ABC"
                }, {
                    LINE: "1",
                    VALUE: "DEF"
                }]
            }, done);
        });

        it("supports value quoting", function (done) {
            _process({
                lines: ["LINE;VALUE", "0;\"ABC\"", "1;DEF", "2;GH\"I", "3;\"JK\"\"L\"", "4;\"MN", "O\""],
                parser: new gpf.stream.csv.Parser(),
                expected: [{
                    LINE: "0",
                    VALUE: "ABC"
                }, {
                    LINE: "1",
                    VALUE: "DEF"
                }, {
                    LINE: "2",
                    VALUE: "GH\"I"
                }, {
                    LINE: "3",
                    VALUE: "JK\"L"
                }, {
                    LINE: "4",
                    VALUE: "MN\nO"
                }]
            }, done);
        });

        it("supports quoting the separator as well", function (done) {
            _process({
                lines: ["LINE;VALUE", "0;\"A;BC\""],
                parser: new gpf.stream.csv.Parser(),
                expected: [{
                    LINE: "0",
                    VALUE: "A;BC"
                }]
            }, done);
        });

        it("supports header being specified as an option", function (done) {
            _process({
                lines: ["0;ABC", "1;DEF"],
                parser: new gpf.stream.csv.Parser({
                    header: "LINE;VALUE"
                }),
                expected: [{
                    LINE: "0",
                    VALUE: "ABC"
                }, {
                    LINE: "1",
                    VALUE: "DEF"
                }]
            }, done);
        });

        it("supports empty values", function (done) {
            _process({
                lines: ["LINE;VALUE;VALUE2", ";AB;CD", "1;;EF", "2;GH"],
                parser: new gpf.stream.csv.Parser(),
                expected: [{
                    LINE: "",
                    VALUE: "AB",
                    VALUE2: "CD"
                }, {
                    LINE: "1",
                    VALUE: "",
                    VALUE2: "EF"
                }, {
                    LINE: "2",
                    VALUE: "GH"
                }]
            }, done);
        });

        it("detects unterminated quoted string", function (done) {
            _pipe({
                lines: ["LINE;VALUE", "0;\"A", "BC"],
                parser: new gpf.stream.csv.Parser()
            })
                .then(function () {
                    done(new Error("Should fail"));
                }, function (reason) {
                    assert(reason instanceof gpf.Error.InvalidCSV);
                    done();
                })["catch"](done);
        });

        it("detects invalid quoted string", function (done) {
            _pipe({
                lines: ["LINE;VALUE", "0;\"A\"BC\""],
                parser: new gpf.stream.csv.Parser()
            })
                .then(function () {
                    done(new Error("Should fail"));
                }, function (reason) {
                    assert(reason instanceof gpf.Error.InvalidCSV);
                    done();
                })["catch"](done);
        });

        it("supports different separator, quote and new line specifiers", function (done) {
            _process({
                lines: ["LINE\tVALUE\tVALUE2", "0\t\t'A''B", "\tC'"],
                parser: new gpf.stream.csv.Parser({
                    separator: "\t",
                    quote: "'",
                    newLine: "\r\n"
                }),
                expected: [{
                    LINE: "0",
                    VALUE: "",
                    VALUE2: "A'B\r\n\tC"
                }]
            }, done);
        });

    });

});
