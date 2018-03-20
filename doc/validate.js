"use strict";

require("colors");

let
    errors = 0;

/* Need source version because of https support */
global.gpfSourcesPath = "src/";
require("../src/boot.js");

const
    CACHE_FILE = "tmp/doc.cache",
    fs = require("fs"),
    gpfFs = gpf.fs.getFileStorage(),
    processed = {},
    cache = [],
    stack = [{
        method: "GET",
        url: process.argv[2]
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
            if (-1 === [200, 301, 302].indexOf(response.status)) {
                console.error(method.magenta, url.magenta, response.status.toString().red);
                return;
            } else {
                if (method === "HEAD") {
                    cache.push(url);
                }
                log(method.grey, url.grey, response.status.toString().green);
            }
            const baseUrl = !gpf.path.extension(url) ? url : gpf.path.parent(url);
            response.responseText.replace(/href="([^"]+)"/g, function (text, subUrl) {
                subUrl = subUrl.replace(/\r|\n/g, "");
                if (subUrl.indexOf("http") !== 0) {
                    // Relative
                    if (gpf.path.extension(subUrl) === ".html") {
                        enqueue({
                            method: "GET",
                            url: gpf.path.join(baseUrl, subUrl)
                        });
                    }
                } else {
                    // Absolute
                    enqueue({
                        method: "HEAD",
                        url: subUrl
                    });
                }
            });
        })
    },

    next = () => stack.length
        ? check(stack.shift()).then(next)
        : 0;

log("Loading cache...");
gpf.fs.read(CACHE_FILE)
    .then(cached => cached.split("\n").forEach(url => {processed[url] = true}), () => {})
    .then(() => {
        log(`Checking ${stack[0].url}...`);
        return next();
    })
    .then(() => {}, () => {}) // Absorb errors
    .then(() => {
        log("Done.");
        if (cache.length) {
            log("Saving cache...");
            return gpfFs.openTextStream(CACHE_FILE, gpf.fs.openFor.appending)
                .then(iWritableStream => iWritableStream.write(cache.join("\n"))
                    .then(() => gpfFs.close(iWritableStream)));
        }
    })
    .then(() => {
        process.exit(errors);
    });
