(function () { /* Begin of privacy scope */
    "use strict";

    var
        // List of hardcoded mime types
        _mimeTypes = {
            "text/css":     [".css"],
            "text/html":    [".htm", ".html"],
            "text/plain":   [".txt", ".text", ".log"],
            "image/gif":    [".gif"],
            "image/jpeg":   [".jpg", ".jpeg"],
            "image/png":    [".png"]
        };

    gpf.declareTests({

        "mime types": [

            function (test) {
                test.title("Testing hardcoded mime types");
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
                            test.equal(gpf.http.getMimeType(extension),
                                mimeType, extension);
                            if(0 === idx) {
                                test.equal(
                                    gpf.http.getFileExtension(mimeType),
                                    extension, mimeType);
                            }
                        }
                    }
                }
                // Testing ultimate defaults
                test.equal(gpf.http.getMimeType(""), "application/octet-stream",
                    "Default mime type");
                test.equal(gpf.http.getFileExtension(""), ".bin",
                    "Default file extension");
            }

        ]

    });

})(); /* End of privacy scope */
