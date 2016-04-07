"use strict";

var path = require("path"),
    gpfPath = path.resolve(__dirname, "../.."),
    useFileAccess = false,
    args = process.argv.slice(2),
    browser = args[0],
    version,
    errorCount,
    webDriver = require("selenium-webdriver"),
    By = require("selenium-webdriver").By,
    until = require("selenium-webdriver").until,
    driver = new webDriver.Builder()
        .forBrowser(browser)
        .build();

if ("-release" === args[1]) {
    version = "?release";
} else if ("-debug" === args[1]) {
    version = "?debug";
} else {
    version = "";
}

if ("-file" === args[2]) {
    useFileAccess = true;
}

if (useFileAccess) {
    driver.get("file://" + gpfPath + "/test/host/web.html" + version);
} else {
    driver.get("http://localhost:8000/test/host/web.html" + version);
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
