"use strict";

// Test automation inside PhantomJS
var webUrl = "http://localhost:" + configuration.httpPort + "/test/host/mocha/web.html";

module.exports = {
    source: {
        options: {
            log: false,
            run: false,
            urls: [webUrl]
        }
    },
    verbose: {
        options: {
            log: true,
            run: false,
            reporter: "spec",
            urls: [webUrl]
        }
    },
    debug: {
        options: {
            log: false,
            run: false,
            urls: [webUrl + "?debug"]
        }
    },
    release: {
        options: {
            log: false,
            run: false,
            urls: [webUrl + "?release"]
        }
    }
};
