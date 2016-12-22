"use strict";

var testTasks = [
    "exec:testWscript",
    "exec:testRhino"
];
configuration.selenium.forEach(function (browser) {
    testTasks.push("exec:test" + browser.charAt(0).toUpperCase() + browser.substr(1));
});

var legacyVersions = require("fs").readdirSync("test/legacy").map(function (name) {
    return name.substr(0, name.lastIndexOf("."));
});
console.log(legacyVersions);

module.exports = {

    // Linters
    linters: [
        "jshint",
        "eslint"
    ],

    // Code quality tools
    quality: [
        "istanbul",
        "plato"
    ],

    // Tests on sources
    source: [
        "mocha:source"
    ].concat(testTasks),

    // Tests on debug version
    debug: [
        "mocha:debug",
        "mochaTest:debug"
    ].concat(testTasks.map(function (name) {
        return name + "Debug";
    })),

    // Tests on release version
    release: [
        "mocha:release",
        "mochaTest:release"
    ].concat(testTasks.map(function (name) {
        return name + "Release";
    }))
};
