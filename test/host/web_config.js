"use strict";

function nop () {}

function verbose (result) {
    result.log = console.log.bind(console);
}

function getParametersPush (param) {
    return function (result, parameters) {
        parameters.push(param);
    };
}

var argumentsHandlers = {
    "-verbose": verbose,
    "-debugger": verbose,
    "-release": getParametersPush("release"),
    "-debug": getParametersPush("debug"),
    "-coverage": getParametersPush("coverage")
};

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
        var handler = argumentsHandlers[arg];
        if (handler) {
            handler(result, parameters);
        } else if (arg.indexOf("legacy/") === 0) {
            parameters.push("version=" + arg.substring(7));
        } else if (arg.indexOf("flavor:") === 0) {
            parameters.push(arg);
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
