"use strict";

describe("stream/line", function () {

    it("generates lines out of any stream", function (done) {
        var lineIndex = 0,
            expectedLines = [
                "abcdef",
                "ghijkl",
                "mnopqr",
                "stuvwx",
                "yz"
            ],
            lineStream = new gpf.stream.LineAdapter(),
            outStream = {
                write: function (buffer) {
                    if (buffer !== expectedLines[lineIndex]) {
                        return Promise.reject("No match");
                    }
                    ++lineIndex;
                    return Promise.resolve("No match");
                }
            };
        lineStream.read(outStream)
            .then(function () {
                return lineStream.write("abc");
            })
            .then(function () {
                return lineStream.write("def\n");
            })
            .then(function () {
                return lineStream.write("gh");
            })
            .then(function () {
                return lineStream.write("ijkl\r");
            })
            .then(function () {
                return lineStream.write("\nmnopqr\n");
            })
            .then(function () {
                return lineStream.write("stuvwx\nyz");
            })
            .then(function () {
                return lineStream.write("\n");
            })
            .then(function () {
                done();
            })["catch"](done);

    });

});
