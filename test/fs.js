(function () { /* Begin of privacy scope */
    "use strict";

    if ("nodejs" === gpf.host() || "phantomjs" === gpf.host()) {

        gpf.declareTests({

            "NodeJS": [

                function (test) {
                    test.title("Get file info");
                    test.wait();
                    gpf.fs.getInfo("../fs.js", function (event) {
                        test.equal(event.type(), "ready", "getInfo");
                        var info = event.get("info");
                        test.assert(info, "Info provided");
                        test.equal(info.type, gpf.fs.TYPE_FILE, "File type");
                        test.done();
                    });
                },

                function (test) {
                    test.title("Read a file");
                    var
                        stream,
                        decoder;
                    test.wait();
                    gpf.fs.readAsBinaryStream("../fs.js", function (event) {
                        test.equal(event.type(), "ready", "readAsBinaryStream");
                        stream = event.get("stream");
                        decoder = gpf.encoding.createDecoder(stream,
                            gpf.encoding.UTF_8);
                        gpf.stringFromStream(decoder, function (event) {
                            if (event.type() === "error") {
                                console.error(event.get("error"));
                            }
                            test.equal(event.type(), "data", "Data event");
                            var content = event.get("buffer"),
                                index = content.indexOf("MyPrivateData");
                            test.notEqual(index, -1, "Found MyPrivateData");
                            test.done();
                        });
                    });
                }
            ]

        });


    }

})(); /* End of privacy scope */

