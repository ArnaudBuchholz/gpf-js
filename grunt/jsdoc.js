"use strict";

module.exports = {

    "private": {
        src: configuration.files.doc.concat([
            "README.md"
        ]),
        options: {
            configure: "doc/private.json",
            access: "all",
            destination: "tmp/doc/private"
        }
    },

    "public": {
        src: configuration.files.doc.concat([
            "README.md"
        ]),
        options: {
            configure: "doc/public.json",
            destination: "tmp/doc/public"
        }
    }

};
