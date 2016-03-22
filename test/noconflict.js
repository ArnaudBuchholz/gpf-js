"use strict";

describe("noconflict", function () {

    describe("gpf as a module", function () {

        if (gpf.HOST_NODEJS === gpf.host()) {
            /*jshint node: true*/
            /*eslint-env node*/

            it("supports multiple instances (node)", function () {
                var path = require("path"),
                    previousGpf = gpf,
                    gpf2;
                gpf2 = require(path.resolve(process.cwd(), "build/gpf-debug.js"));
                assert("object" === typeof gpf2);
                assert(null !== gpf2);
                assert(previousGpf === gpf);
            });

        } else if ((gpf.HOST_BROWSER === gpf.host() || gpf.HOST_PHANTOMJS === gpf.host())
            && window.gpfSourcesPath) {
            /*jshint browser: true*/
            /*eslint-env browser*/

            //TODO when run directly in phantomJs (not loaded through a page), this fails
            it("supports multiple includes (browser)", function (done) {
                var previousGpf = gpf;
                gpf.web.include(gpfSourcesPath + "../build/gpf-debug.js", {
                    "ready": function () {
                        var gpf2 = gpf.noConflict();
                        assert("object" === typeof gpf2);
                        assert(null !== gpf2);
                        assert(previousGpf === gpf);
                        done();
                    }
                });
            });

        }

    });

});
