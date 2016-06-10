"use strict";

module.exports = {
    dist: {
        src: configuration.docFiles.concat([
            "README.md"
        ]),
        options: {
            destination: "tmp/docs",
            recurse: true
        }
    }
};
