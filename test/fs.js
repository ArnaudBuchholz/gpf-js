(function () { /* Begin of privacy scope */
    "use strict";

    /*jshint -W027*/ // Done on purpose until gpf.declareTests is removed
    return;

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
                    test.title("Read a file (full)");
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
                },

                function (test) {
                    test.title("Read a file (stringFromFile)");
                    test.wait();
                    gpf.stringFromFile("../fs.js", gpf.encoding.UTF_8,
                        function (event) {
                            if (event.type() === "error") {
                                console.error(event.get("error"));
                            }
                            test.equal(event.type(), "data", "Data event");
                            var content = event.get("buffer"),
                                index = content.indexOf("MyPrivateData");
                            test.notEqual(index, -1, "Found MyPrivateData");
                            test.done();
                        }
                    );
                }
            ]

        });

    }

    /*MyPrivateData*/

})(); /* End of privacy scope */

