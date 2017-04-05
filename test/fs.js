"use strict";

describe("fs", function () {

    describe("gpf.fs.getFileStorage", function () {

        it("is implemented only on specific hosts", function () {
            var iFileStorage = gpf.fs.getFileStorage(),
                host = gpf.host();
            if (gpf.hosts.unknown === host) {
                assert(gpf.interfaces.isImplementedBy(gpf.interfaces.IFileStorage, iFileStorage));
            } else {
                assert(null === iFileStorage);
            }
        });

    });

});
