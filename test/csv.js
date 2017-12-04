"use strict";

describe("csv", function () {

    describe("gpf.csv.parse", function () {

        function _pipe (params) {
            var csv,
                iWritableArray = new gpf.stream.WritableArray();
            if (Array.isArray(params.csv)) {
                csv = params.csv.join("\r\n");
            } else {
                csv = params.csv;
            }
            return gpf.stream.pipe(new gpf.stream.ReadableString(csv), params.parser, iWritableArray)
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
                csv: ["LINE", "0", "1"],
                parser: new gpf.csv.Parser(),
                expected: [{
                    LINE: "0"
                }, {
                    LINE: "1"
                }]
            }, done);
        });

        it("reads a CSV file", function (done) {
            _process({
                csv: ["LINE;VALUE", "0;ABC", "1;DEF"],
                parser: new gpf.csv.Parser(),
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
                csv: ["LINE;VALUE", "0;\"ABC\"", "1;DEF", "2;GH\"I", "3;\"JK\"\"L\"", "4;\"MN", "O\""],
                parser: new gpf.csv.Parser(),
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
                csv: ["LINE;VALUE", "0;\"A;BC\""],
                parser: new gpf.csv.Parser(),
                expected: [{
                    LINE: "0",
                    VALUE: "A;BC"
                }]
            }, done);
        });

        it("supports header being specified as an option", function (done) {
            _process({
                csv: ["0;ABC", "1;DEF"],
                parser: new gpf.csv.Parser({
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

        it("detects unterminated quoted string", function (done) {
            _pipe({
                csv: ["LINE;VALUE", "0;\"A", "BC"],
                parser: new gpf.csv.Parser()
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
                csv: ["LINE;VALUE", "0;\"A\"BC\""],
                parser: new gpf.csv.Parser()
            })
                .then(function () {
                    done(new Error("Should fail"));
                }, function (reason) {
                    assert(reason instanceof gpf.Error.InvalidCSV);
                    done();
                })["catch"](done);
        });

    });

});
