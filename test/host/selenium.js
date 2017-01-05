"use strict";

var path = require("path"),
    gpfPath = path.resolve(__dirname, "../.."),
    useFileAccess = false,
    httpPort = "8000",
    args = process.argv.slice(2),
    browser = args[0],
    parameters = [],
    errorCount,
    buildWebDriverFor = require("../../seleniumDriverFactory.js"),
    By = require("selenium-webdriver").By,
    until = require("selenium-webdriver").until,
    driver = buildWebDriverFor(browser);

args.slice(1).forEach(function (arg) {
    if ("-release" === arg) {
        parameters.push("release");
    } else if ("-debug" === arg) {
        parameters.push("debug");
    } else if ("-file" === arg) {
        useFileAccess = true;
    } else if (0 === arg.indexOf("-port:")) {
        httpPort = arg.substr(6);
    } else if (0 === arg.indexOf("legacy/")) {
        parameters.push("version=" + arg.substr(7));
    }
});

if (parameters.length) {
    parameters = "?" + parameters.join("&");
} else {
    parameters = "";
}

if (useFileAccess) {
    driver.get("file://" + gpfPath + "/test/host/web.html" + parameters);
} else {
    driver.get("http://localhost:" + httpPort + "/test/host/web.html" + parameters);
}

driver.wait(until.titleIs("GPF Tests - done"), 10000);
driver.findElements(By.id("status"))
    .then(function (elements) {
        return elements[0].getText();
    })
    .then(function (text) {
        console.log(text);
        if (0 === text.indexOf("OK")) {
            errorCount = 0;
        } else {
            // Search for failure: <number> <timespent>
            errorCount = parseInt(text.split("failure: ")[1].split(" ")[0], 10);
        }
        return driver.quit();
    })
    .then(function () {
        process.exit(errorCount);
    });
