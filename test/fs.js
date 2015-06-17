"use strict";
/*global describe, it, assert, beforeEach*/

describe("fs", function () {

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

});
