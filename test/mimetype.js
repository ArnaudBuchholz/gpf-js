"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

describe("mimetype", function () {

    describe("hard-coded mime types", function () {

        var
            gpfW = gpf.web,
            // List of hardcoded mime types
            _mimeTypes = {
                "application/javascript":       [".js"],
                "image/gif":                    [".gif"],
                "image/jpeg":                   [".jpg", ".jpeg"],
                "image/png":                    [".png"],
                "text/css":                     [".css"],
                "text/html":                    [".htm", ".html"],
                "text/plain":                   [".txt", ".text", ".log"]
            };

        it("supports a list of pre-defined mime types", function () {
            var
                mimeType,
                extensions,
                len,
                idx,
                ext;
            for (mimeType in _mimeTypes) {
                if (_mimeTypes.hasOwnProperty(mimeType)) {
                    extensions = _mimeTypes[mimeType];
                    len = extensions.length;
                    for (idx = 0; idx < len; ++idx) {
                        ext = extensions[idx];
                        assert(gpfW.getMimeType(ext) === mimeType);
                        if(0 === idx) {
                            assert(gpfW.getFileExtension(mimeType) === ext);
                        }
                    }
                }
            }
        });

        it("supports a default mime type", function () {
            assert(gpfW.getMimeType("") === "application/octet-stream");
        });

        it("supports a default extension", function () {
            assert(gpfW.getFileExtension("") === ".bin");
        });

    });

});
