"use strict";

// Custom command lines
module.exports = {
    buildDebug: {
        cmd: "node make.js debug",
        cwd: "make",
        stdout: false,
        stderr: false,
        exitCode: 0
    },
    buildRelease: {
        cmd: "node make.js release",
        cwd: "make",
        stdout: false,
        stderr: false,
        exitCode: 0
    },
    plato: {
        cmd: "node node_modules/plato/bin/plato -l .jshintrc -t GPF-JS -d tmp/plato "
                 + configuration.srcFiles.join(" "),
        stdout: true,
        stderr: true
    },
    metrics: {
        cmd: "node make/metrics.js",
        stdout: false,
        stderr: true,
        exitCode: 0
    },
    globals: {
        cmd: "node make/globals.js",
        stdout: false,
        stderr: true,
        exitCode: 0
    },
    version: {
        cmd: "node make/version.js",
        stdout: false,
        stderr: false,
        exitCode: 0
    },
    detectSelenium: {
        cmd: "node test/host/selenium/detect.js",
        stdout: true,
        stderr: true,
        exitCode: 0
    },
    jsdoc: {
        cmd: function () {
            return "node node_modules/jsdoc/jsdoc -d tmp/jsdoc --verbose "
                + "-c doc/private.json " + [].slice.call(arguments).join(" ");
        },
        stdout: true,
        stderr: true,
        exitCode: 0
    },
    fixUglify: {
        cmd: function (name) {
            return "node make/fix_uglify.js " + name;
        },
        stdout: true,
        stderr: true,
        exitCode: 0
    }
};

function _buildTestConfig (name, command) {
    function buildCommand (suffix) {
        return function () {
            var parameter;
            if (0 === arguments.length) {
                parameter = "";
            } else {
                parameter = " " + [].slice.call(arguments, 0).join(" ");
            }
            return command + parameter + suffix;
        };
    }
    module.exports["test" + name] = {
        cmd: buildCommand(""),
        stdout: false,
        stderr: false,
        exitCode: 0
    };
    module.exports["test" + name + "Verbose"] = {
        cmd: buildCommand(" -debugger"),
        stdout: true,
        stderr: true,
        exitCode: 0
    };
    module.exports["test" + name + "Debug"] = {
        cmd: buildCommand(" -debug"),
        stdout: false,
        stderr: false,
        exitCode: 0
    };
    module.exports["test" + name + "Release"] = {
        cmd: buildCommand(" -release"),
        stdout: false,
        stderr: false,
        exitCode: 0
    };
    module.exports["test" + name + "Legacy"] = {
        cmd: function (version) {
            return command + " legacy/" + version;
        },
        stdout: false,
        stderr: false,
        exitCode: 0
    };
}

_buildTestConfig("Node", "node test/host/nodejs.js");
_buildTestConfig("Phantom", "node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs test/host/phantomjs.js");
_buildTestConfig("Wscript", "cscript.exe /D /E:JScript test/host/cscript.js");
_buildTestConfig("Rhino", "java -jar node_modules/rhino-1_7r5-bin/rhino1_7R5/js.jar test/host/rhino.js");
configuration.selenium.forEach(function (browser) {
    _buildTestConfig(browser.charAt(0).toUpperCase() + browser.substr(1), "node test/host/selenium.js " + browser
        + " -port:" + configuration.httpPort);
});
