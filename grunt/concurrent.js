"use strict";

let testTasks = [];

if (configuration.host.java) {
    testTasks.push("exec:testRhino");
}

if (configuration.host.nashorn) {
    testTasks.push("exec:testNashorn");
}

if (configuration.host.wscript) {
    testTasks.push("exec:testWscript");
} else {
    testTasks.push("exec:testNodewscript");
}

Object.keys(configuration.browsers).forEach(browserName => {
    testTasks.push(`exec:test${browserName.charAt(0).toUpperCase()}${browserName.substr(1)}`);
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
        "mocha:source",
        "mochaTest:source"
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
    ].concat(testTasks.map(name => name + "Release"))

};

configuration.files.legacyTest.forEach(versionFile => {
    let version = versionFile.substr(0, versionFile.lastIndexOf("."));
    module.exports[`legacy${version}`] = testTasks.map(task => `${task}Legacy:${version}`);
});
