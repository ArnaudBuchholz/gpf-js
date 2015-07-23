"use strict";
/*global describe, it, assert, beforeEach*/

describe("fs", function () {

    if (null === gpf.fs.host()) {
        return; // No host
    }

    describe("gpf.fs.host", function () {

        var
            gpfI = gpf.interfaces,
            iFs;

        beforeEach(function () {
            iFs = gpf.fs.host();
        });

        it("gives access to a IFileStorage interface", function () {
            assert(null !== iFs);
            if (null !== iFs) {
                assert(gpfI.isImplementedBy(iFs, gpfI.IFileStorage));
            }
        });

    });

    describe("Data generator", function () {

        it("file.bin", function (done) {
            var fs = gpf.fs.host();
            fs.getInfo("test/data/file.bin", function (event) {
                if (event.type === gpf.events.EVENT_READY
                    && event.get("info").type === gpf.fs.TYPE_FILE
                   ) {
                    done(); // Already exists
                    return;
                }
                // File does not exist, generates
                var
                    count = 0,
                    wStream;
                function loop(event) {
                    assert(!event || gpf.events.EVENT_READY === event.type);
                    if (256 === count) {
                        fs.close(wStream, function () {});
                        done();
                    }
                    wStream.write([count++], loop);
                }
                // Current path is always root of gpf-js
                fs.writeAsBinaryStream("test/data/file.bin",
                    function (event) {
                        assert(gpf.events.EVENT_READY === event.type);
                        wStream = event.get("stream");
                        loop();
                    }
                );
            });
        });

    });

});
