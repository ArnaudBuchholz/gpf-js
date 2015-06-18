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
            iWScriptFs.writeAsBinaryStream("tmp\\fs_ms.bin", function (event) {
                assert(gpf.events.EVENT_READY === event.type);
                var wStream = event.get("stream");
                wStream.write([0, 34, 75, 0, 128, 255], function (event) {
                    assert(gpf.events.EVENT_READY === event.type);
                    iWScriptFs.close(wStream);
                    done();
                });
            });
        });

    });

});