"use strict";

const
    fs = require("fs"),
    path = require("path"),
    vlq = require("vlq"),
    sources = [{
        "name": "sources"
    }],

    buildSources = (response) => {

    },

    buildSourcesMap = (response) => {

    },

    handlers = {

        "/src/boot.js?map": response => {
            response.setHeader("Content-Type", "application/javascript");
            fs.readFile(path.join(__dirname, "../../src/boot.js"), (err, data) => {
                if (err) {
                    response.statusCode = 500;
                    response.end(err.toString());
                } else {
                    response.end(data.toString().replace("sources.json", "sources.json?map"));
                }
            });
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
