"use strict";

module.exports = {

    "private": {
        src: configuration.docFiles.concat([
            "README.md"
        ]),
        options: {
            configure: "doc/jsdoc.conf.json",
            access: "all",
            destination: "tmp/doc/private"
        }
    },

    "public": {
        src: configuration.docFiles.concat([
            "README.md"
        ]),
        options: {
            configure: "doc/jsdoc.conf.json",
            destination: "tmp/doc/public"
        }
    }

};
