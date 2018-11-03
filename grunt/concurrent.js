"use strict";

const
    tools = require("../res/tools.js"),
    hosts = {
        browser: Object.keys(configuration.browsers).map(browserName => tools.capitalize(browserName)),
        nodejs: ["Node"],
        phantomjs: ["Phantom"],
        java: [],
        wscript: []
    },
    // As of now, this list is 'static', on MacOS, Safari is considered modern
    modernBrowsers = ["chrome", "firefox", tools.isMacOS ? "safari" : ""].map(tools.capitalize);

hosts.modernBrowser = hosts.browser.filter(name => modernBrowsers.indexOf(name) !== -1);

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
    quality: {
        tasks: [
            "istanbul",
            "plato"
        ],
        options: {
            logConcurrentOutput: true
        }
    },

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

const hostPrefix = "host:";

Object.keys(configuration.files.flavors).forEach(flavor => {
    const
        definition = configuration.files.flavors[flavor],
        flavorHosts = definition.flavor.split(" ")
            .filter(token => token.indexOf(hostPrefix) === 0)
            .map(token => token.substr(hostPrefix.length)),
        includesCompatibility = definition.flavor.split(" ").indexOf("compatibility") !== -1,
        tasks = Object.keys(hosts)
            .filter(name => flavorHosts.length === 0 || flavorHosts.indexOf(name) !== -1)
            .map(name => includesCompatibility || name !== "browser" ? name : "modernBrowser")
            .reduce((list, name) => list.concat(hosts[name]), [])
            .map(name => `exec:test${name}`);
    module.exports[`flavor@${flavor}`] = tasks.map(name => `${name}Flavor:${flavor}`);
});

configuration.files.legacyTest.forEach(versionFile => {
    let version = versionFile.substr(0, versionFile.lastIndexOf("."));
    module.exports[`legacy${version}`] = testTasks.map(task => `${task}Legacy:${version}`);
});
