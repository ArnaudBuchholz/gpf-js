"use strict";

function nop () {}

var fs = require("fs"),
    childProcess = require("child_process"),
    http = require("http"),
    // kill = require("../../res/kill.js"),
    args = process.argv.slice(2),
    config = JSON.parse(fs.readFileSync("tmp/config.json")),
    log = nop,
    parameters = [],
    browserName = "chrome",
    browserBin,
    uid = process.pid;

args.forEach(function (arg) {
    if ("-verbose" === arg) {
        log = console.log.bind(console);
    } else if ("-release" === arg) {
        parameters.push("release");
    } else if ("-debug" === arg) {
        parameters.push("debug");
    } else if (0 === arg.indexOf("legacy/")) {
        parameters.push("version=" + arg.substr(7));
    } else {
        browserName = arg;
    }
});

parameters.push("cache=" + uid);
parameters = "?" + parameters.join("&");

log("UID         : " + uid);
log("Browser     : " + browserName);
log("HTTP port   : " + config.serve.httpPort);
log("Parameters  : " + parameters);

if (!config.browsers[browserName]) {
    console.error("Browser '" + browserName + "' not configured");
    process.exit(-1);
}
browserBin = config.browsers[browserName].bin;

var browserProcess = childProcess.spawn(browserBin, [
    "http://localhost:" + config.serve.httpPort + "/test/host/web.html" + parameters
], {
    detached: true
});

browserProcess.stdout.on("data", function (text) {
    log(text);
});

browserProcess.on("close", function () {
    log("Browser process ended.");
});

log("Browser PID : " + browserProcess.pid);

// Wait for cached result
function checkForCachedResult () {
    http.get({
        hostname: "localhost",
        port: config.serve.httpPort,
        path: "/cache/" + uid,
        agent: false
    }, function (res) {
        if (res.statusCode === 200) {
            browserProcess.kill("SIGKILL");
            // kill(browserProcess.pid);
            var data = [];
            res
                .on("data", function (chunk) {
                    data.push(chunk);
                })
                .on("end", function () {
                    data = Buffer.concat(data).toString();
                    log(data);
                    process.exit(JSON.stringify(data).fail);
                });

        } else {
            setTimeout(checkForCachedResult, 100); // Loop
        }
    });
}
checkForCachedResult();
