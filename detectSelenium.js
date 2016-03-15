"use strict";
/*jshint node: true*/
/*eslint-env node*/

/*eslint-disable no-sync*/

var fs = require("fs"),
    webDriver = require("selenium-webdriver"),
    browsers = JSON.parse(fs.readFileSync("selenium.json").toString()),
    promises = [];

// Pre-create the tmp folder (it might already exist)
try {
    fs.mkdirSync("tmp"); // May already exist
} catch (e) {} //eslint-disable-line no-empty

console.log("Testing drivers declared in ./selenium.json");

function report (browser, status) {
    var message = "\t" + browser + " ";
    message += "........................................".substr(message.length);
    message += " ";
    if (status) {
        console.log(message + "OK");
    } else {
        console.log(message + "KO");
    }
}

browsers.forEach(function (browser) {
    promises.push(new Promise(function (resolve /*, reject*/) {
        function fail (reason) {
            report(browser, false);
            if (reason && reason.message) {
                console.warn(reason.message);
            }
            resolve(false);
        }
        try {
            var driver = new webDriver.Builder().forBrowser(browser).build();
            driver.quit().then(function () {
                report(browser, true);
                resolve(true);
            }, fail);
        } catch (e) {
            console.log(e);
            fail();
        }
    }));
});

Promise.all(promises).then(function (detectedDrivers) {
    console.log("Saving tmp/selenium.json");
    var list = browsers.filter(function (browser, index) {
        return detectedDrivers[index];
    });
    fs.writeFileSync("./tmp/selenium.json", JSON.stringify(list));
    process.exit(0);
});
