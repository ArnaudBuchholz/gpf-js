"use strict";

const
    fs = require("fs"),
    path = require("path"),
    vlq = require("vlq"),
    ConfigFile = require("../../make/configFile.js"),
    sources = [{
        "name": "sources"
    }],

    error = (response, err) => {
        response.statusCode = 500;
        response.end(err.toString());
    },

    readFile = name => new Promise((resolve, reject) =>
        fs.readFile(name, (err, data) => err ? reject(err) : resolve(data.toString()))),

    readSource = name => readFile(path.join(__dirname, `../../src/${name}.js`)),

    getSources = () => readFile(path.join(__dirname, "../../src/sources.json"))
        .then(content => JSON.parse(content))
        .then(sources => sources.filter(source => source.load !== false))
        .then(sources => sources.map(source => source.name)),

    buildSources = response => getSources()
        .then(sources => Promise.all(sources.map(name => readSource(name))))
        .then(sources => {
            var configFile = new ConfigFile();
            response.write(`//# sourceURL=http://localhost:${configFile.content.serve.httpPort}/src/sources.js.map\n`);
            response.end(sources.join("\n"));
        }),

    buildSourcesMap = response => getSources()
        .then(sources => {
            const
                sourcesMap = {
                    version : 3,
                    file: "sources.js",
                    sourceRoot : "",
                    sources: sources.map(name => `${name}.js`),
                    names: [],
                    mappings: ""
                };
            response.end(JSON.stringify(sourcesMap));
        }),

    handlers = {

        "/src/boot.js?map": response => {
            response.setHeader("Content-Type", "application/javascript");
            readSource("boot")
                .then(content => response.end(content.replace("sources.json", "sources.json?map")))
                .catch(err => error(response, err));
        },

        "/src/sources.json?map": response => {
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify(sources));
        },

        "/src/sources.js": response => {
            response.setHeader("Content-Type", "application/javascript");
            buildSources(response);
        },

        "/src/sources.js.map": response => {
            response.setHeader("Content-Type", "application/json");
            buildSourcesMap(response);
        }

    };

module.exports = (request, response, next) => {

    let notAnswered = true;

    Object.keys(handlers).forEach(urlEnd => {
        if (request.url.endsWith(urlEnd)) {
            handlers[urlEnd](response);
            notAnswered = false;
        }
    });

    if (notAnswered) {
        return next();
    }

};
