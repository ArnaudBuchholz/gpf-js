"use strict";

describe("stream/bitreader", function () {

    var
        _string = "GPF RULEZ",
        _utf8 = "R1BGIFJVTEVa"; // Using http://www.base64encode.org/

    it("helps encoding a string to Base64", function (done) {
        var
            len = _string.length,
            idx,
            array = new Array(len),
            input,
            reader,
            result = [];
        function callback (event) {
            if (event.type === _EOS) {
                assert(result.join("") === _utf8);
                done();
                return;
            }
            assert(event.type === _DATA);
            result.push(gpf.bin.toBase64(event.get("buffer")[0]));
            reader.read(6, callback);
        }
        for (idx = 0; idx < len; ++idx) {
            array[idx] = _string.charCodeAt(idx);
        }
        input = gpf.arrayToStream(array);
        reader = new gpf.stream.BitReader(input);
        reader.read(6, callback);
    });

});
