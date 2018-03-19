"use strict";

const
    gpf = require("../build/gpf.js"),
    processed = {},
    stack = [process.argv[2]],

    check = (url) => {
        if (processed.hasOwnProperty(url)) {
            return Promise.resolve();
        }
        return gpf.http.get(url).then(response => {
            console.log(url, response.status);
            if (response.status !== 200) {
                processed[url] = false;
                return;
            }
            processed[url] = true;
            const baseUrl = !gpf.path.extension(url) ? url : gpf.path.parent(url);
            response.responseText.replace(/href="([^"]+)"/g, function (text, subUrl) {
                if (subUrl.indexOf("http") !== 0 && gpf.path.extension(subUrl) === ".html") {
                    stack.push(gpf.path.join(baseUrl, subUrl));
                }
            });
        })
    },

    next = () => stack.length
        ? check(stack.shift()).then(next)
        : 0;

console.log(`Checking ${stack[0]}`);
next().then(() => {
    console.log(`Done...`);
});
