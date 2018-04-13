"use strict";

// Test automation inside PhantomJS

const
    webUrl = `http://localhost:${configuration.serve.httpPort}/test/host/mocha/web.html`,
    common = {
        growlOnSuccess: false,
        run: false
    };

module.exports = {
    source: {
        options: Object.assign({
            log: false,
            urls: [webUrl]
        }, common)
    },
    verbose: {
        options: Object.assign({
            log: true,
            reporter: "spec",
            urls: [webUrl]
        }, common)
    },
    debug: {
        options: Object.assign({
            log: false,
            urls: [webUrl + "?debug"]
        }, common)
    },
    release: {
        options: Object.assign({
            log: false,
            urls: [webUrl + "?release"]
        }, common)
    },
    legacy:  {
        options: Object.assign({
            log: false,
            urls: [webUrl + "?version=<%= grunt.task.current.args[0] %>"]
        }, common)
    }
};
