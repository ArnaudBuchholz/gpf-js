"use strict";

const
    fs = require("fs"),
    tools = require("../res/tools.js"),
    osPathSeparator = require("path").sep,
    isWindows = (/^win/).test(process.platform),
    toArray = arrayLike => [].slice.call(arrayLike),
    sep = path => osPathSeparator === "/" ? path : path.replace(/\//g, osPathSeparator),

    // Node supports / on any host
    platoCmd = "node node_modules/plato/bin/plato -l .jshintrc -t GPF-JS -d tmp/plato",
    jsdocCmd = "node node_modules/jsdoc/jsdoc -d tmp/jsdoc --verbose -a all -c doc/private.json",
    checkdocCmd = `node doc/validate http://localhost:${configuration.serve.httpPort}/tmp/doc/public/index.html`,

    config = (cmd, ...options) => {
        if ("string" === typeof cmd || "function" === typeof cmd) {
            cmd = {
                cmd: cmd
            };
        }
        return Object.assign.apply(Object, [cmd].concat(options));
    },

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
    },

    testConfig = (name, command, parameters) => {
        if (isWindows && command.indexOf(" ") !== -1) {
            command = `"${command}"`;
        }
        command += ` ${parameters}`;
        const cmd = suffix => function () {
            let parameter;
            if (arguments.length) {
                parameter = toArray(arguments).join(" ") + " ";
            } else {
                parameter = "";
            }
            return command + " " + parameter + suffix;
        };
        module.exports[`test${name}`] = config(cmd(""), silent, failIfNot0);
        module.exports[`test${name}Verbose`] = config(cmd("-debugger"), verbose, failIfNot0);
        module.exports[`test${name}Coverage`] = config(cmd("-coverage"), silent, failIfNot0);
        module.exports[`test${name}Debug`] = config(cmd("-debug"), silent, failIfNot0);
        module.exports[`test${name}Release`] = config(cmd("-release"), silent, failIfNot0);
        module.exports[`test${name}Legacy`] = config(version => `${command} legacy/${version}`, silent, failIfNot0);
    };

let phantomJsBin = "/usr/local/phantomjs/bin/phantomjs"; // If already installed
if (!fs.existsSync(phantomJsBin)) {
    // Assume it is installed with the phantomjs-prebuilt package
    phantomJsBin = sep("node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs");
}

// Custom command lines
module.exports = {
    buildDebug: config({cmd: "node make.js debug", cwd: "make"}, silent, failIfNot0),
    buildRelease: config({cmd: "node make.js release", cwd: "make"}, silent, failIfNot0),
    plato: config(() => `${platoCmd} ${configuration.files.src.join(" ")}`, verbose),
    metrics: config((...args) => `node make/metrics.js ${args.join(" ")}`, showErrors, failIfNot0),
    globals: config("node make/globals.js", showErrors, failIfNot0),
    version: config("node make/version.js", silent, failIfNot0),
    detectSelenium: config("node test/host/selenium/detect.js", verbose, failIfNot0),
    jsdoc: config((...args) => `${jsdocCmd} ${args.join(" ")}`, verbose, failIfNot0),
    fixUglify: config(name => `node make/fix_uglify.js ${name}`, verbose, failIfNot0),
    checkDoc: config(checkdocCmd, verbose, failIfNot0)
};

// Flavor builds
Object.keys(configuration.files.flavors).forEach(flavor => {
    module.exports[`build${tools.capitalize(flavor)}`] = config({
        cmd: `node make.js flavor/${flavor}`,
        cwd: "make"
    }, silent, failIfNot0);
});

// Test configurations
testConfig("Node", "node", "test/host/nodejs.js");
testConfig("Phantom", phantomJsBin, sep("--web-security=false test/host/phantomjs.js"));
testConfig("Wscript", "cscript.exe", `/D /E:JScript ${sep("test/host/cscript.js")}`);
testConfig("Nodewscript", "node", "test/host/node_cscript.js");
testConfig("Rhino", "java", sep("-jar node_modules/rhino-1_7r5-bin/rhino1_7R5/js.jar test/host/java.js"));
testConfig("Nashorn", configuration.host.nashorn, sep("test/host/java.js  --"));

Object.keys(configuration.browsers).forEach(browserName =>{
    const
        browserConfig = configuration.browsers[browserName],
        capitalizedBrowserName = tools.capitalize(browserName);
    if ("selenium" === browserConfig.type) {
        testConfig(capitalizedBrowserName, "node", `test/host/selenium.js ${browserName}`);
    } else if ("spawn" === browserConfig.type) {
        testConfig(capitalizedBrowserName, "node", `test/host/browser.js ${browserName}`);
    }
});
