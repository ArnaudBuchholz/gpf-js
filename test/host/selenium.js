"use strict";

var path = require("path"),
    gpfPath = path.resolve(__dirname, "../..");

var webdriver = require("selenium-webdriver"),
    By = require("selenium-webdriver").By,
    until = require("selenium-webdriver").until;

var driver = new webdriver.Builder()
    .forBrowser("chrome") // or firefox
    .build();

driver.get("file://" + gpfPath + "/test/host/web.html");
driver.wait(until.titleIs("GPF Tests - done"), 5000);
driver.findElements(By.id("status"))
    .then(function (elements) {
        return elements[0].getText();
    })
    .then(function (text) {
        console.log(text);
        driver.quit();
    });
