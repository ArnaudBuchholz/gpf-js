"use strict";

describe("stream/line", function () {

    function _part1 (lineStream) {
        return lineStream.write("abc")
            .then(function () {
                return lineStream.write("def\n");
            })
            .then(function () {
                return lineStream.write("gh");
            })
            .then(function () {
                return lineStream.write("ijkl\r");
            });
    }

    function _part2 (lineStream) {
        return lineStream.write("\nmnopqr\n")
            .then(function () {
                return lineStream.write("stuvwx\nyz");
            });
    }

    function _getOutput () {
        var lineIndex = 0,
            expectedLines = [
                "abcdef",
                "ghijkl",
                "mnopqr",
                "stuvwx",
                "yz"
            ];
        return {
            write: function (buffer) {
                if (buffer !== expectedLines[lineIndex]) {
                    return Promise.reject("No match");
                }
                ++lineIndex;
                return Promise.resolve();
            }
        };
    }

    it("generates lines out of any stream (read first)", function (done) {
        var lineStream = new gpf.stream.LineAdapter();
        lineStream.read(_getOutput())
            .then(function () {
                return _part1(lineStream);
            })
            .then(function () {
                return _part2(lineStream);
            })
            .then(function () {
                return lineStream.flush();
            })
            .then(function () {
                done();
            })["catch"](done);
    });

    it("generates lines out of any stream (write first)", function (done) {
        var lineStream = new gpf.stream.LineAdapter();
        _part1(lineStream)
            .then(function () {
                return _part2(lineStream);
            })
            .then(function () {
                return lineStream.write("\n");
            })
            .then(function () {
                return lineStream.flush();
            })
            .then(function () {
                return lineStream.read(_getOutput());
            })
            .then(function () {
                done();
            })["catch"](done);
    });

    it("generates lines out of any stream (mixed)", function (done) {
        var lineStream = new gpf.stream.LineAdapter();
        _part1(lineStream)
            .then(function () {
                return lineStream.read(_getOutput());
            })
            .then(function () {
                return _part2(lineStream);
            })
            .then(function () {
                return lineStream.flush();
            })
            .then(function () {
                done();
            })["catch"](done);
    });

});
