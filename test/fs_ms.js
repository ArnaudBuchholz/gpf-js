"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

/*eslint-disable max-nested-callbacks*/

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