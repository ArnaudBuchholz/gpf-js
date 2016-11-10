"use strict";

// Test automation inside PhantomJS
var webUrl = "http://localhost:" + configuration.httpPort + "/test/host/mocha/web.html";

module.exports = {
    source: {
        options: {
            log: false,
            run: false
        },
        src: [webUrl]
    },
    verbose: {
        options: {
            log: true,
            run: false
        },
        src: [webUrl]
    },
    debug: {
        options: {
            log: false,
            run: false
        },
        src: [webUrl + "?debug"]
    },
    release: {
        options: {
            log: false,
            run: false
        },
        src: [webUrl + "?release"]
    }
};
