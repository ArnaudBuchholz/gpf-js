"use strict";
/*global describe, it, assert, beforeEach*/

describe("fs_ms", function () {

    if ("wscript" !== gpf.host()) {
        return; // Skip
    }

    var
        gpfI = gpf.interfaces,
        iWScriptFs;

    beforeEach(function () {
        iWScriptFs = new gpf.fs.WScriptFileStorage();
    });

    describe("gpf.fs.WScriptFileStorage", function () {

        it("implements IFileStorage", function () {
            assert(gpfI.isImplementedBy(iWScriptFs, gpfI.IFileStorage));
        });

        it("saves binary files", function (done) {
            iWScriptFs.writeAsBinaryStream("tmp\\test\\fs_ms.bin",
                function (event) {
                    assert(gpf.events.EVENT_READY === event.type);
                    var wStream = event.get("stream");
                    wStream.write([0, 34, 75, 0, 128, 255], function (event) {
                        assert(gpf.events.EVENT_READY === event.type);
                        iWScriptFs.close(wStream);
                        done();
                    });
                });
        });

        it("reads binary files", function (done) {
            iWScriptFs.readAsBinaryStream("test\\data\\file.bin",
                function (event) {
                    assert(gpf.events.EVENT_READY === event.type);
                    var rStream = event.get("stream");
                    rStream.read(1, function (event) {
                        assert(gpf.events.EVENT_DATA === event.type);
                        var buffer = event.get("buffer");
                        assert(1 === buffer.length);
                        assert(0 === buffer[0]);
                        iWScriptFs.close(rStream);
                        done();
                    });
                });
        });
    });

});