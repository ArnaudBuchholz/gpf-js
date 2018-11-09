"use strict";

require("colors");

let
    errors = 0;

/* Need source version because of https support */
global.gpfSourcesPath = "src/";
require("../src/boot.js");

const
    START = 0,
    CACHE_FILE = "tmp/doc.cache",
    AFTER_COMMAND = 2,
    HTTP_OK = 200,
    HTTP_MOVED_PERMANENTLY = 301,
    HTTP_FOUND = 302,
    gpfFs = gpf.fs.getFileStorage(),
    processed = {},
    cache = [],
    stack = [{
        method: "GET",
        url: process.argv[AFTER_COMMAND]
    }],
    verbose = process.argv.some(arg => arg === "-verbose"),
    log = verbose ? console.log.bind(console) : () => {},

    enqueue = ({url, method}) => {
        if (!processed.hasOwnProperty(url)) {
            stack.push({url, method});
        }
    },

    check = ({url, method}) => {
        if (processed.hasOwnProperty(url)) {
            return Promise.resolve();
        }
        return gpf.http[method.toLowerCase()](url).then(response => {
            processed[url] = response;
            if (![HTTP_OK, HTTP_MOVED_PERMANENTLY, HTTP_FOUND].includes(response.status)) {
                ++errors;
                console.error(method.magenta, url.magenta, response.status.toString().red);
                return;
            }
            if (method === "HEAD") {
                cache.push(url);
            }
            log(method.grey, url.grey, response.status.toString().green);
            const baseUrl = gpf.path.extension(url) ? gpf.path.parent(url) : url;
            response.responseText.replace(/href="([^"]+)"/g, function (text, multilineSubUrl) {
                var subUrl = multilineSubUrl.replace(/\r|\n/g, "");
                if (subUrl.startsWith("http")) {
                    // Absolute
                    enqueue({
                        method: "HEAD",
                        url: subUrl
                    });
                } else if (gpf.path.extension(subUrl) === ".html") {
                    // Relative
                    enqueue({
                        method: "GET",
                        url: gpf.path.join(baseUrl, subUrl)
                    });
                }
            });
        });
    },

    next = () => stack.length
        ? check(stack.shift()).then(next)
        : Promise.resolve();

log("Loading cache...");
gpf.fs.read(CACHE_FILE)
    .then(cached => cached.split("\n").forEach(url => {
        processed[url] = true;
    }), () => {})
    .then(() => {
        log(`Checking ${stack[START].url}...`);
        return next();
    })
    .then(() => {}, () => {}) // Absorb errors
    .then(() => {
        log("Done.");
        if (cache.length) {
            log("Saving cache...");
            let cacheFile;
            return gpfFs.openTextStream(CACHE_FILE, gpf.fs.openFor.appending)
                .then(iWritableStream => {
                    cacheFile = iWritableStream;
                    return cacheFile.write(cache.join("\n"));
                })
                .then(() => gpfFs.close(cacheFile));
        }
    })
    .then(() => {
        process.exit(errors);
    });
