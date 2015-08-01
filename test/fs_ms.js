"use strict";
/*global describe, it, assert, beforeEach*/

describe("fs_ms", function () {

    if (gpf.HOST_WSCRIPT !== gpf.host()) {
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

    });

    // Interface is tested through fs.js

});