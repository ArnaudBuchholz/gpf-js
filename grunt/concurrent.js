"use strict";

const
    tools = require("../res/tools.js"),
    hosts = {
        browser: Object.keys(configuration.browsers).map(browserName => tools.capitalize(browserName)),
        nodejs: ["Node"],
        phantomjs: ["Phantom"],
        java: [],
        wscript: []
    };

if (configuration.host.java) {
    hosts.java.push("Rhino");
}

if (configuration.host.nashorn) {
    hosts.java.push("Nashorn");
}

if (configuration.host.wscript) {
    hosts.wscript.push("Wscript");
} else {
    hosts.wscript.push("Nodewscript");
}

const
    testTasks = Object.keys(hosts).reduce((list, name) => list.concat(hosts[name]), []).map(name => `exec:test${name}`),
    noMocha = x => x !== "exec:testNode" && x !== "exec:testPhantom";

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
    ].concat(testTasks.filter(noMocha)),

    // Tests on debug version
    debug: [
        "mocha:debug",
        "mochaTest:debug"
    ].concat(testTasks.filter(noMocha).map(name => `${name}Debug`)),

    // Tests on release version
    release: [
        "mocha:release",
        "mochaTest:release"
    ].concat(testTasks.filter(noMocha).map(name => `${name}Release`))

};

Object.keys(configuration.files.flavors).forEach(flavor => {
    const
        definition = configuration.files.flavors[flavor],
        flavorHosts = definition.flavor.split(" ")
            .filter(token => 0 === token.indexOf("host:"))
            .map(token => token.substr(5)),
        tasks = Object.keys(hosts)
            .filter(name => 0 === flavorHosts.length || -1 !== flavorHosts.indexOf(name))
            .reduce((list, name) => list.concat(hosts[name]), [])
            .map(name => `exec:test${name}`);
    module.exports[`flavor@${flavor}`] = tasks.map(name => `${name}Flavor:${flavor}`);
});

configuration.files.legacyTest.forEach(versionFile => {
    let version = versionFile.substr(0, versionFile.lastIndexOf("."));
    module.exports[`legacy${version}`] = testTasks.map(task => `${task}Legacy:${version}`);
});
