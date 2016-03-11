"use strict";

// Test automation inside PhantomJS
module.exports = {
    source: {
        options: {
            log: false,
            run: false
        },
        src: ["test/host/mocha/web.html"]
    },
    verbose: {
        options: {
            log: true,
            run: false
        },
        src: ["test/host/mocha/web.html"]
    },
    debug: {
        options: {
            log: false,
            run: false
        },
        src: ["test/host/mocha/web_debug.html"]
    },
    release: {
        options: {
            log: false,
            run: false
        },
        src: ["test/host/mocha/web_release.html"]
    }
};
