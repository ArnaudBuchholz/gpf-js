"use strict";

describe("stream/line", function () {

    it("generate lines out of any stream", function (done) {
        var lineIndex = 0,
            expectedLines = [
                "abcdef",
                "ghijkl",
                "mnopqr",
                "stuvwx",
                "yz"
            ],
            lineStream = new gpf.stream.Line(),
            outStream = {
                write: function (buffer) {
                    if (buffer !== expectedLines[lineIndex]) {
                        return Promise.reject("No match");
                    }
                    ++lineIndex;
                    return Promise.resolve("No match");
                }
            };
        lineStream.pipe(outStream);
        lineStream.write("abc")
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
                lineStream.flush();
            })
            .then(function () {
                done();
            })["catch"](done);

    });

});
