(function () { /* Begin of privacy scope */
    "use strict";

    /*jshint -W027*/ // Done on purpose until gpf.declareTests is removed
    return;

    var
        _EOS = gpf.interfaces.IReadableStream.EVENT_END_OF_STREAM,
        _DATA = gpf.interfaces.IReadableStream.EVENT_DATA,
        _string = "GPF RULEZ",
        _utf8 = "R1BGIFJVTEVa"; // Using http://www.base64encode.org/

    gpf.declareTests({

        "bitreader": [

            function (test) {
                test.title("Use BitReader to encode in Base64");
                var
                    len = _string.length,
                    idx,
                    array = new Array(len),
                    input,
                    reader,
                    result = [],
                    callback = function (event) {
                        if (event.type() === _EOS) {
                            test.equal(result.join(""), _utf8, "Correct");
                            test.done();
                            return;
                        }
                        test.equal(event.type(), _DATA, "Data event");
                        result.push(gpf.bin.toBase64(event.get("buffer")[0]));
                        reader.read(6, callback);
                    };
                test.log("Convert the string into a byte array");
                for (idx = 0; idx < len; ++idx) {
                    array[idx] = _string.charCodeAt(idx);
                }
                input = gpf.arrayToStream(array);
                reader = new gpf.stream.BitReader(input);
                test.wait();
                reader.read(6, callback);
            },

            function (test) {
                test.title("Use gpf.stream.readAllAsB64 to encode in Base64");
                var
                    len = _string.length,
                    idx,
                    array = new Array(len);
                test.log("Convert the string into a byte array");
                for (idx = 0; idx < len; ++idx) {
                    array[idx] = _string.charCodeAt(idx);
                }
                test.wait();
                gpf.stream.readAllAsB64(gpf.arrayToStream(array),
                    function (event) {
                        test.equal(event.type(), _DATA, "Data event");
                        test.equal(event.get("buffer"), _utf8, "Correct");
                        test.done();
                    }
                );
            }

        ],

        "out": [

            function (test) {
                test.title("gpf.stream.Out");
                var
                    gpfI = gpf.interfaces,
                    output = [],
                    out,
                    wout;
                test.hookConsole(output);
                test.wait();
                out = new gpf.stream.Out();
                wout = new (gpfI.wrap(gpfI.IWritableStream))(out);
                wout
                    .write("abc")
                    .write("de")
                    .write("f\r\nhi")
                    .write("\n")
                    .$finally(function () {
                        test.releaseConsole();
                        test.equal(output.length, 2, "Right number of lines");
                        test.equal(output[0].log, "abcdef", "First line OK");
                        test.equal(output[1].log, "hi", "Second line OK");
                        test.done();
                    });
            }

        ]

    });

}()); /* End of privacy scope */
