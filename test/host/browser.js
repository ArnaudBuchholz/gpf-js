"use strict";

var childProcess = require("child_process"),
    http = require("http"),
    uid = process.pid,
    config = require("./web_config.js")("spawn", "cache=" + uid),
    args = (config.browser.args || []).concat(config.url);

config.log("SPAWN " + config.browser.bin + " " + args.join(" "));
var browserProcess = childProcess.spawn(config.browser.bin, args, {
    detached: true
});

browserProcess.stdout.on("data", function (text) {
    config.log(text);
});

browserProcess.on("close", function () {
    config.log("Browser process ended.");
});

// Wait for cached result
function checkForCachedResult () {
    http.get({
        hostname: "localhost",
        port: config.httpPort,
        path: "/cache/" + uid,
        agent: false
    }, function (res) {
        if (res.statusCode === 200) {
            browserProcess.kill("SIGKILL");
            var data = [];
            res
                .on("data", function (chunk) {
                    data.push(chunk);
                })
                .on("end", function () {
                    data = Buffer.concat(data).toString();
                    console.log(data);
                    process.exit(JSON.stringify(data).fail);
                });

        } else {
            setTimeout(checkForCachedResult, 100); // Loop
        }
    });
}
checkForCachedResult();
