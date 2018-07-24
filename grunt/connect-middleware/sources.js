"use strict";

let
    cachedUglifyResult;

const
    fs = require("fs"),
    path = require("path"),
    UglifyJS = require("uglify-js"),
    ConfigFile = require("../../make/configFile.js"),
    basePath = `http://localhost:${(new ConfigFile()).content.serve.httpPort}/src/`,

    readFile = name => new Promise((resolve, reject) =>
        fs.readFile(name, (err, data) => err ? reject(err) : resolve(data.toString()))),

    readSource = name => readFile(path.join(__dirname, `../../src/${name}.js`)),

    getSources = () => readFile(path.join(__dirname, "../../src/sources.json"))
        .then(content => JSON.parse(content))
        .then(sources => sources.filter(source => source.load !== false))
        .then(sources => sources.map(source => source.name)),

    uglifySources = sources => {
        const names = sources;
        return Promise.all(sources.map(name => readSource(name)))
            .then(contents => {
                const code = names.reduce((consolidated, name, index) => {
                    consolidated[`${basePath}${name}.js`] = contents[index];
                    return consolidated;
                }, {});
                return UglifyJS.minify(code, {
                    compress: false,
                    mangle: false,
                    sourceMap: {
                        filename: `${basePath}sources.js`,
                        url: `${basePath}sources.js.map`
                    }
                });
            });
    },

    uglify = () => getSources().then(uglifySources),

    getUglifyResult = () => cachedUglifyResult
        ? Promise.resolve(cachedUglifyResult)
        : uglify().then(uglifyResult => {
            cachedUglifyResult = uglifyResult;
            return cachedUglifyResult;
        }),

    handlers = {

        "/src/boot.js?map": response => {
            response.setHeader("Content-Type", "application/javascript");
            return readSource("boot", response)
                .then(content => response.end(content.replace("sources.json", "sources.json?map")));
        },

        "/src/sources.json?map": response => {
            response.setHeader("Content-Type", "application/json");
            cachedUglifyResult = null; // Reset cache
            response.end(JSON.stringify([{
                "name": "sources"
            }]));
            return Promise.resolve();
        },

        "/src/sources.js": response => {
            response.setHeader("Content-Type", "application/javascript");
            return getUglifyResult().then(function (result) {
                response.end(result.code);
            });
        },

        "/src/sources.js.map": response => {
            response.setHeader("Content-Type", "application/json");
            return getUglifyResult().then(function (result) {
                response.end(result.map);
            });
        }

    };

module.exports = (request, response, next) => {

    let notAnswered = true;

    Object.keys(handlers).forEach(urlEnd => {
        if (request.url.endsWith(urlEnd)) {
            handlers[urlEnd](response)
                .then(undefined, reason => {
                    response.statusCode = 500;
                    response.end(reason.toString());
                });
            notAnswered = false;
        }
    });

    if (notAnswered) {
        return next();
    }

};
