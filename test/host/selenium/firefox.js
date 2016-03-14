"use strict";

var path = require("path"),
    gpfPath = path.resolve(__dirname, "../../..");

var webdriver = require("selenium-webdriver"),
    By = require("selenium-webdriver").By,
    until = require("selenium-webdriver").until;

var driver = new webdriver.Builder()
    .forBrowser("firefox")
    .build();

driver.get("file://" + gpfPath + "/test/host/web.html");
driver.wait(until.titleIs(""), 5000);
driver.quit();
