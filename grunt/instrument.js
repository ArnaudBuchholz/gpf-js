"use strict";

module.exports = {
    files: "src/**/*.js",
    options: {
        lazy: true,
        debug: true,
        noCompact: true,
        noAutoWrap: true,
        basePath: "tmp/coverage/instrument/"
    }
};
