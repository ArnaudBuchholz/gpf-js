"use strict";

var config = require("./web_config.js")("selenium"),
    errorCount,
    buildWebDriverFor = require("./selenium/driverFactory.js"),
    By = require("selenium-webdriver").By,
    until = require("selenium-webdriver").until,
    driver = buildWebDriverFor(config.browserName);

driver.get(config.url);
driver.wait(until.titleIs("GPF Tests - done"), 10000);
driver.findElements(By.id("status"))
    .then(function (elements) {
        return elements[0].getText();
    })
    .then(function (text) {
        console.log(text);
        if (text.indexOf("OK") === 0) {
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
