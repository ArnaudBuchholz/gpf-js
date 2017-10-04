"use strict";
/*jshint node: true*/
/*eslint-env node*/

const
    fs = require("fs"),
    path = require("path"),

    defaultContent = {
        version: 1,
        serve: {
            httpPort: 8000
        },
        host: {
            wscript: false,
            java: false
        },
        browsers: {},
        metrics: {
            coverage: {
                statements: 90,
                functions: 90,
                branches: 90,
                lines: 90
            },
            maintainability: 70
        }
    },

    contentMigrationPath = [
        content => {
            /*
             * from: selenium.browsers: [name]
             * to: browsers: { name: { type: "selenium" } }
             */
            content.browsers = {};
            content.selenium.browsers.forEach(name => {
                content.browsers[name] = {
                    type: "selenium"
                };
            });
            delete content.selenium; // No more needed
        }
    ];

module.exports = class ConfigFile {

    constructor () {
        this.read();
    }

    getFileName () {
        if (!this._fileName) {
            this._fileName = path.join(__dirname, "../tmp/config.json");
        }
        return this._fileName;
    }

    read () {
        let fileName = this.getFileName();
        if (fs.existsSync(fileName)) {
            this.content = JSON.parse(fs.readFileSync(fileName).toString());
            this.savedJSON = JSON.stringify(this.content); // Ignore formatting
            this._checkVersion();
        } else {
            this.content = defaultContent;
            this.savedJSON = "";
        }
    }

    _checkVersion () {
        let currentVersion = this.content.version || 0;
        if (currentVersion < contentMigrationPath.length) {
            contentMigrationPath.slice(currentVersion).forEach(migrate => migrate(this.content));
            this.content.version = contentMigrationPath.length;
            this.save();
        }
    }

    isNew () {
        return !this.savedJSON;
    }

    isModified () {
        return JSON.stringify(this.content) !== this.savedJSON;
    }

    save () {
        if (this.isModified()) {
            let json = JSON.stringify(this.content);
            fs.writeFileSync(this.getFileName(), json);
            this.savedJSON = json;
        }
    }

    readSourceFiles () {
        // Build the list of valid source and test files based on sources.json
        let sources = JSON.parse(fs.readFileSync(path.join(__dirname, "../src/sources.json"))),
            srcFiles = ["src/boot.js"],
            docFiles = ["src/boot.js"],
            testFiles = [];
        sources.forEach(source => {
            let name = source.name;
            if (source.load !== false) {
                srcFiles.push("src/" + name + ".js");
                if (source.test !== false) {
                    testFiles.push("test/" + name + ".js");
                }
                if (source.doc === true) {
                    docFiles.push("src/" + name + ".js");
                }
            }
        });
        this.content.files = {
            src: srcFiles,
            test: testFiles,
            legacyTest: fs.readdirSync(path.join(__dirname, "../test/legacy"))
                .filter(name => name.endsWith(".js")),
            doc: docFiles,
            linting: {
                js: [
                    "gruntfile.js",
                    "grunt/**/*.js",
                    "statistics.js",
                    "make/*.js",
                    "test/host/**/*.js",
                    "res/*.js"
                ]
                    .concat(srcFiles)
                    .concat(testFiles)
            }
        };
    }

    enableBrowserType (browserName, browserType) {
        if (!this.content.browsers.hasOwnProperty(browserName)) {
            this.content.browsers[browserName] = {
                type: browserType
            };
        }
    }

    disableBrowserType (browserName, browserType) {
        let config = this.content.browsers[browserName];
        if (config && browserType === config.type) {
            delete this.content.browsers[browserName];
        }
    }

    setBrowserTypeEnabled (browserName, browserType, enabled) {
        if (enabled) {
            this.enableBrowserType(browserName, browserType);
        } else {
            this.disableBrowserType(browserName, browserType);
        }
    }

};
