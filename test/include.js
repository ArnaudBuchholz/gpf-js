"use strict";
/*global describe, it, assert*/

describe("include", function () {

    describe("gpf.web.include", function () {
        var installed = gpf.web && gpf.web.include;

        it("should exist only if in a browser environment", function () {
            var host = gpf.host();
            if (-1 < ["browser", "phantomjs"].indexOf(host)) {
                assert(installed);
            } else {
                assert(!installed);
            }
        });

        if (!installed) {
            return;
        }

        it("allows injection of any script");
        it("signals successful script injection");
        it("signals failed script injection");

    });

});
