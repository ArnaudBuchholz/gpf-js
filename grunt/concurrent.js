"use strict";

var testTasks = [
    "exec:testWscript",
    "exec:testRhino"
];
configuration.selenium.forEach(browser => {
    testTasks.push("exec:test" + browser.charAt(0).toUpperCase() + browser.substr(1));
});

var legacyTasks = [];
require("fs")
    .readdirSync("test/legacy")
    .map(name => name.substr(0, name.lastIndexOf(".")))
    .forEach(version => {
        legacyTasks = legacyTasks.concat(testTasks.map(task => `${task}Legacy:${version}`));
    });

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
    ].concat(testTasks.map(name => name + "Debug")),

    // Tests on release version
    release: [
        "mocha:release",
        "mochaTest:release"
    ].concat(testTasks.map(name => name + "Release")),

    // Tests on legacy test cases
    legacy: legacyTasks

};
