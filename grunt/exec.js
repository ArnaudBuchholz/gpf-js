"use strict";

const
    pathSep = require("path").sep,

    silent = {
        stdout: false,
        stderr: false
    },
    showErrors = {
        stdout: false,
        stderr: true
    },
    verbose = {
        stdout: true,
        stderr: true
    },
    failIfNot0 = {
        exitCode: 0
    };

// Custom command lines
module.exports = {
    buildDebug: Object.assign({
        cmd: "node make.js debug",
        cwd: "make"
    }, silent, failIfNot0),
    buildRelease: Object.assign({
        cmd: "node make.js release",
        cwd: "make"
    }, silent, failIfNot0),
    plato: Object.assign({
        cmd: () => "node node_modules/plato/bin/plato -l .jshintrc -t GPF-JS -d tmp/plato "
                    + configuration.files.src.join(" ")
    }, verbose),
    metrics: Object.assign({
        cmd: "node make/metrics.js"
    }, showErrors, failIfNot0),
    globals: Object.assign({
        cmd: "node make/globals.js"
    }, showErrors, failIfNot0),
    version: Object.assign({
        cmd: "node make/version.js"
    }, silent, failIfNot0),
    detectSelenium: Object.assign({
        cmd: "node test/host/selenium/detect.js"
    }, verbose, failIfNot0),
    jsdoc: Object.assign({
        cmd: function () {
            return "node node_modules/jsdoc/jsdoc -d tmp/jsdoc --verbose -a all "
                + "-c doc/private.json " + [].slice.call(arguments).join(" ");
        }
    }, verbose, failIfNot0),
    fixUglify: Object.assign({
        cmd: name => `node make/fix_uglify.js ${name}`
    }, verbose, failIfNot0)
};

function _buildTestConfig (name, command) {
    function buildCommand (suffix) {
        return function () {
            let parameter;
            if (0 === arguments.length) {
                parameter = "";
            } else {
                parameter = " " + [].slice.call(arguments, 0).join(" ");
            }
            return command + parameter + suffix;
        };
    }
    module.exports["test" + name] = Object.assign({
        cmd: buildCommand("")
    }, silent, failIfNot0);
    module.exports["test" + name + "Verbose"] = Object.assign({
        cmd: buildCommand(" -debugger")
    }, verbose, failIfNot0);
    module.exports["test" + name + "Coverage"] = Object.assign({
        cmd: buildCommand(" -coverage")
    }, silent, failIfNot0);
    module.exports["test" + name + "Debug"] = Object.assign({
        cmd: buildCommand(" -debug")
    }, silent, failIfNot0);
    module.exports["test" + name + "Release"] = Object.assign({
        cmd: buildCommand(" -release")
    }, silent, failIfNot0);
    module.exports["test" + name + "Legacy"] = Object.assign({
        cmd: version => `${command} legacy/${version}`
    }, silent, failIfNot0);
}

_buildTestConfig("Node", "node test/host/nodejs.js");
_buildTestConfig("Phantom", `node_modules${pathSep}phantomjs-prebuilt${pathSep}lib${pathSep}phantom${pathSep}bin`
                            + `${pathSep}phantomjs --web-security=false test/host/phantomjs.js`);
_buildTestConfig("Wscript", "cscript.exe /D /E:JScript test/host/cscript.js");
_buildTestConfig("Rhino", "java -jar node_modules/rhino-1_7r5-bin/rhino1_7R5/js.jar test/host/rhino.js");
Object.keys(configuration.browsers).forEach(browserName =>{
    let browserConfig = configuration.browsers[browserName],
        capitalizedBrowserName = browserName.charAt(0).toUpperCase() + browserName.substr(1);
    if ("selenium" === browserConfig.type) {
        _buildTestConfig(capitalizedBrowserName, `node test/host/selenium.js ${browserName}`);
    } else if ("spawn" === browserConfig.type) {
        _buildTestConfig(capitalizedBrowserName, `node test/host/browser.js ${browserName}`);
    }
});
