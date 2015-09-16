"use strict";
/*global describe, it, assert, beforeEach*/

describe("fs_node", function () {

    if (gpf.HOST_NODEJS !== gpf.host()) {
        return; // Skip
    }

    var gpfI = gpf.interfaces,
        iNodeFs;

    beforeEach(function () {
        iNodeFs = new gpf.fs.NodeFileStorage();
    });

    describe("gpf.fs.NodeFileStorage", function () {

        it("implements IFileStorage", function () {
            assert(gpfI.isImplementedBy(iNodeFs, gpfI.IFileStorage));
        });

    });

    // Interface is tested through fs.js

});


/*
        gpf.declareTests({

            "NodeJS": [

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
