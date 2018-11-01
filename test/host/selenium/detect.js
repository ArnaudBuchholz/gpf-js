"use strict";
/*jshint node: true*/
/*eslint-env node*/

/*eslint-disable no-sync*/

var ConfigFile = require("../../../make/configFile.js"),
    configFile = new ConfigFile(),
    buildWebDriverFor = require("./driverFactory.js"),
    fs = require("fs"),
    browsers = JSON.parse(fs.readFileSync("test/host/selenium/browsers.json").toString()),
    promises = [];

// Pre-create the tmp folder (it might already exist)
try {
    fs.mkdirSync("tmp"); // May already exist
} catch (e) {} //eslint-disable-line no-empty

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

function detect (browser) {
    return new Promise(function (resolve /*, reject*/) {

        function fail (reason) {
            report(browser, false);
            if (reason && reason.message) {
                console.error(reason.message);
            }
            resolve(false);
            process.removeListener("uncaughtException", fail);
        }

        process.once("uncaughtException", fail);

        try {
            var driver = buildWebDriverFor(browser);
            if (driver === null) {
                throw new Error("Driver missing for '" + browser + "'");
            }
            driver.quit().then(function () {
                report(browser, true);
                resolve(true);
                process.removeListener("uncaughtException", fail);
            }, fail);
        } catch (e) {
            fail(e);
        }
    });
}

var browser = process.argv[2];
if (browser) {
    console.log("Testing driver for: " + browser);
    detect(browser).then(function () {
        process.exit(0);
    });

} else {
    console.log("Testing drivers declared in test/host/selenium/browsers.json");

    browsers.forEach(function (browserToDetect) {
        promises.push(detect(browserToDetect));
    });

    Promise.all(promises).then(function (detectedDrivers) {
        browsers.forEach(function (browserToDetect, index) {
            configFile.setBrowserTypeEnabled(browserToDetect, "selenium", detectedDrivers[index]);
        });
        configFile.save();
        process.exit(0);
    });
}

