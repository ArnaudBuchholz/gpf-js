"use strict";

module.exports = {
    dist: {
        src: configuration.docFiles.concat([
            "README.md"
        ]),
        options: {
            configure: "doc/jsdoc.conf.json",
            destination: "tmp/docs"
        }
    }
};
