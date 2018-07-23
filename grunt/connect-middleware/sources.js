"use strict";

const
    fs = require("fs"),
    path = require("path"),
    vlq = require("vlq"),
    sources = [{
        "name": "sources"
    }],

    error = (response, err) => {
        response.statusCode = 500;
        response.end(err.toString());
    },

    readFile = name => new Promise((resolve, reject) =>
        fs.readFile(name, (err, data) => err ? reject(err) : resolve(data.toString()))),

    readSource = name => readFile(path.join(__dirname, "../../src/" + name + ".js")),

    getSources = () => readFile(path.join(__dirname, "../../src/sources.json"))
        .then(content => JSON.parse(content)),

    buildSources = response => getSources()
        .then(sources => response.end(JSON.stringify(sources))),

    buildSourcesMap = response => response.end("{}"),

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
