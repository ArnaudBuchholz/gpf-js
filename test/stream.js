"use strict";
/*global describe, it, assert*/

describe("stream", function () {

    var
        _EOS = gpf.events.EVENT_END_OF_DATA,
        _DATA = gpf.events.EVENT_DATA,
        _string = "GPF RULEZ",
        _utf8 = "R1BGIFJVTEVa"; // Using http://www.base64encode.org/

    describe("bitreader", function () {

        it("helps encoding a string to Base64", function (done) {
            var
                len = _string.length,
                idx,
                array = new Array(len),
                input,
                reader,
                result = [],
                callback = function (event) {
                    if (event.type === _EOS) {
                        assert(result.join("") === _utf8);
                        done();
                        return;
                    }
                    assert(event.type === _DATA);
                    result.push(gpf.bin.toBase64(event.get("buffer")[0]));
                    reader.read(6, callback);
                };
            for (idx = 0; idx < len; ++idx) {
                array[idx] = _string.charCodeAt(idx);
            }
            input = gpf.arrayToStream(array);
            reader = new gpf.stream.BitReader(input);
            reader.read(6, callback);
        });

    });

    describe("gpf.stream.readAllAsB64", function () {

        it("encodes a string in Base64", function (done) {
            var
                len = _string.length,
                idx,
                array = new Array(len);
            for (idx = 0; idx < len; ++idx) {
                array[idx] = _string.charCodeAt(idx);
            }
            gpf.stream.readAllAsB64(gpf.arrayToStream(array),
                function (event) {
                    assert(event.type === _DATA);
                    assert(event.get("buffer") === _utf8);
                    done();
                }
            );
        });

    });

    describe("gpf.stream.Out", function () {

        it("outputs on the console", function (done) {
            var
                gpfI = gpf.interfaces,
                out,
                wout;
            console.expects("log", "abcdef");
            console.expects("log", "hi");
            out = new gpf.stream.Out();
            wout = new (gpfI.wrap(gpfI.IWritableStream))(out);
            wout
                .write("abc")
                .write("de")
                .write("f\r\nhi")
                .write("\n")
                .$finally(function () {
                    // TODO check if console exception works fine
                    done();
                });
        });

    });

});