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

    var _expectedLines = [
        "abcdef",
        "ghijkl",
        "mnopqr",
        "stuvwx",
        "yz"
    ];

    function _getOutput () {
        return {
            _index: 0,
            write: function (buffer) {
                if (buffer !== _expectedLines[this._index]) {
                    return Promise.reject("No match");
                }
                ++this._index;
                return Promise.resolve();
            }
        };
    }

    it("generates lines out of any stream (read first)", function (done) {
        var lineStream = new gpf.stream.LineAdapter(),
            output = _getOutput();
        lineStream.read(output)
            .then(function () {
                assert(output._index === _expectedLines.length);
                done();
            })["catch"](done);
        _part1(lineStream)
            .then(function () {
                return _part2(lineStream);
            })
            .then(function () {
                lineStream.flush();
            });
    });

    it("generates lines out of any stream (write first)", function (done) {
        var lineStream = new gpf.stream.LineAdapter(),
            output = _getOutput();
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
                return lineStream.read(output);
            })
            .then(function () {
                assert(output._index === _expectedLines.length);
                done();
            })["catch"](done);
    });

    it("generates lines out of any stream (mixed)", function (done) {
        var lineStream = new gpf.stream.LineAdapter(),
            output = _getOutput();
        _part1(lineStream)
            .then(function () {
                lineStream.read(_getOutput())
                    .then(function () {
                        assert(output._index === _expectedLines.length);
                        done();
                    })["catch"](done);
                _part2(lineStream)
                    .then(function () {
                        return lineStream.flush();
                    });

            });
    });

});
