"use strict";

describe("noconflict", function () {

    describe("gpf as a module", function () {

        if (gpf.hosts.nodejs === gpf.host()) {
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

        } else if ((gpf.hosts.browser === gpf.host() || gpf.hosts.phantomjs === gpf.host())
            && window.gpfSourcesPath && gpf.web.include) {
            /*jshint browser: true*/
            /*eslint-env browser*/

            //TODO when run directly in phantomJs (not loaded through a page), this fails
            it("supports multiple includes (browser)", function (done) {
                var previousGpf = gpf;
                gpf.web.include(gpfSourcesPath + "../build/gpf-debug.js")
                    .then(function () {
                        var gpf2 = gpf.noConflict();
                        assert("object" === typeof gpf2);
                        assert(null !== gpf2);
                        assert(previousGpf === gpf);
                        done();
                    });
            });

        }

    });

});
