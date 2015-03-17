"use strict";
/*global describe, it, assert*/

describe("mimetype", function () {

    describe("hard-coded mime types", function () {

        var
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
                extension;
            for (mimeType in _mimeTypes) {
                if (_mimeTypes.hasOwnProperty(mimeType)) {
                    extensions = _mimeTypes[mimeType];
                    len = extensions.length;
                    for (idx = 0; idx < len; ++idx) {
                        extension = extensions[idx];
                        assert(gpf.web.getMimeType(extension) === mimeType);
                        if(0 === idx) {
                            assert(gpf.web.getFileExtension(mimeType) === extension);
                        }
                    }
                }
            }
        });

        it("supports a default mime type", function () {
            assert(gpf.web.getMimeType("") === "application/octet-stream");
        });

        it("supports a default extension", function () {
            assert(gpf.web.getFileExtension("") === ".bin");
        });

    });

});