"use strict";

function nop () {}

/**
 * Read the configuration & process parameters to determine the browser type and URL
 *
 * @param {String} browserType Expected browser type
 * @param {String} urlParameters Additional URL parameters
 * @return {Object} containing
 * - {String} url URL to run
 * - {Number} httpPort
 * - {Object} browser Browser specific configuration
 * - {Function} log A log function
 */
module.exports = function (browserType, urlParameters) {
    var ConfigFile = require("../../make/configFile.js"),
        configFile = new ConfigFile(),
        parameters = [],
        browserName,
        result = {
            httpPort: configFile.content.serve.httpPort,
            log: nop
        };

    if (urlParameters) {
        parameters.push(urlParameters);
    }
    process.argv.slice(2).forEach(function (arg) {
        if ("-verbose" === arg || "-debugger" === arg) {
            result.log = console.log.bind(console);
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

    result.browserName = browserName;
    result.browser = configFile.content.browsers[browserName];
    if (undefined === result.browser) {
        console.error("Browser '" + browserName + "' not configured");
        process.exit(-1);
    }
    if (browserType !== result.browser.type) {
        console.error("Browser '" + browserName + "' does not match expected type (" + browserType + ")");
        process.exit(-2);
    }

    result.url = "http://localhost:" + result.httpPort + "/test/host/web.html?" + parameters.join("&");

    return result;
};
