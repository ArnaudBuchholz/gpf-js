"use strict";
/*jshint node: true*/
/*eslint-env node*/

/*eslint-disable no-sync*/

var fs = require("fs"),
    webDriver = require("selenium-webdriver");

module.exports = function (browser) {
    var optionsValues,
        browserDriver,
        options;
    try {
        optionsValues = JSON.parse(fs.readFileSync("tmp/selenium-" + browser + ".json"));
    } catch (e) {
        optionsValues = {};
    }
    try {
        browserDriver = require("selenium-webdriver/" + browser);
        options = new browserDriver.Options();
        Object.keys(optionsValues).forEach(function (method) {
            options[method](optionsValues[method]);
        });
        return new webDriver.Builder()
            .withCapabilities(options.toCapabilities())
            .build();
    } catch (e) {
        return null;
    }
};
