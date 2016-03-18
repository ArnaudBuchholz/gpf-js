"use strict";

var testTasks = [
    "exec:testWscript",
    "exec:testRhino"
];
configuration.selenium.forEach(function (browser) {
    testTasks.push("exec:test" + browser.charAt(0).toUpperCase() + browser.substr(1));
});

module.exports = {
    source: ["mocha:source"].concat(testTasks),
    debug: ["mocha:debug", "mochaTest:debug"].concat(testTasks.map(function (name) {
        return name + "Debug";
    })),
    release: ["mocha:release", "mochaTest:release"].concat(testTasks.map(function (name) {
        return name + "Release";
    }))
};
