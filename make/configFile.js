"use strict";
/*jshint node: true*/
/*eslint-env node*/

const
    fs = require("fs"),
    path = require("path"),

    flavorFolder = path.join(__dirname, "../make/flavor"),
    flavorPath = name => path.join(flavorFolder, name),

    defaultContent = {
        version: 1,
        serve: {
            httpPort: 8000
        },
        host: {
            wscript: false,
            java: false,
            nashorn: false
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

    constructor (readSourceFiles = false) {
        this.read();
        if (readSourceFiles) {
            this.readSourceFiles();
        }
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
        const initialVersion = 0;
        let currentVersion = this.content.version || initialVersion;
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
        let srcFiles = [],
            testFiles = [],
            testIncludeFiles = [];
        JSON.parse(fs.readFileSync(path.join(__dirname, "../src/sources.json"))).forEach(source => {
            srcFiles.push(`src/${source.name}.js`);
            if (source.test !== false) {
                testFiles.push(`test/${source.name}.js`);
            }
        });
        // Check test files to see if any include is used
        testFiles.forEach(source => fs
            .readFileSync(path.join(__dirname, "../", source))
            .toString()
            .replace(/\binclude\b\("([^"]*)"\)/g, (match, include) => {
                testIncludeFiles.push(`test/${include}.js`);
            })
        );
        this.content.files = {
            src: srcFiles,
            test: testFiles,
            testInclude: testIncludeFiles,
            legacyTest: fs.readdirSync(path.join(__dirname, "../test/legacy"))
                .filter(name => name.endsWith(".js"))
                .reduce((versions, versionFile) => {
                    // Keep only highest patch of each version (#238)
                    const
                        versionParts = (/(\d+\.\d+)\.(\d+)/).exec(versionFile),
                        VERSION_NAME = 0,
                        MAIN_VERSION = 1,
                        PATCH_VERSION = 2,
                        version = versionParts[MAIN_VERSION],
                        patch = parseInt(versionParts[PATCH_VERSION], 10);
                    let
                        versionFound = false,
                        resultVersions = versions.map(testedVersionFile => {
                            const
                                testedVersionParts = (/(\d+\.\d+)\.(\d+)/).exec(testedVersionFile),
                                testedVersion = testedVersionParts[MAIN_VERSION],
                                testedPatch = parseInt(testedVersionParts[PATCH_VERSION], 10);
                            if (testedVersion === version) {
                                versionFound = true;
                                if (testedPatch < patch) {
                                    return versionParts[VERSION_NAME];
                                }
                            }
                            return testedVersionFile;
                        });
                    if (!versionFound) {
                        resultVersions.push(versionParts[VERSION_NAME]);
                    }
                    return resultVersions;
                }, []),
            doc: srcFiles,
            linting: {
                js: [
                    "gruntfile.js",
                    "grunt/**/*.js",
                    "statistics.js",
                    "make/*.js",
                    "test/host/**/*.js",
                    "res/**/*.js",
                    "doc/*.js"
                ]
                    .concat(srcFiles)
                    .concat(testFiles)
                    .concat(testIncludeFiles)
            },
            flavors: fs.readdirSync(flavorFolder).reduce((flavors, name) => {
                flavors[path.basename(name, ".json")] = JSON.parse(fs.readFileSync(flavorPath(name)));
                return flavors;
            }, {})
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
