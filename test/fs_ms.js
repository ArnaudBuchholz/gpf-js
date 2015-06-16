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
            iWScriptFs.writeAsBinaryStream("tmp/fs.tmp", function (event) {
                assert(gpf.events.EVENT_READY === event.type);
                var wStream = event.get("stream");
                wStream.write([1, 2, 3], function (event) {
                    assert(gpf.events.EVENT_READY === event.type);
                    iWScriptFs.close(wStream);
                    done();
                });
            });
        });

    });

});