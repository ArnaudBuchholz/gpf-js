"use strict";

let
    gh;

const
    // url = require("url"),
    GitHub = require("github-api"),
    ConfigFile = require("../../make/configFile.js"),
    BASE_URL = "/github/",

    connect = () => gh
        ? Promise.resolve(gh)
        : new Promise(resolve => {
            var configFile = new ConfigFile();
            if (!(configFile.content.github && configFile.content.github.token)) {
                throw new Error("Missing github/token configuration");
            }
            gh = new GitHub({
                token: configFile.content.github.token
            });
            resolve(gh);
        })
    ;


module.exports = (request, response, next) => {

    if (0 !== request.url.indexOf(BASE_URL)) {
        return next();
    }

    connect()
        .then(github => github.getUser().getProfile())
        .then(answer => {
            response.statusCode = 200;
            response.write("Hello " + answer.data.name);
            response.end();

        })["catch"](reason => {
            console.log(gh);
            response.statusCode = 500;
            response.setHeader("Content-Type", "text/plain; charset=utf-8");
            response.write(reason.message || JSON.stringify(reason));
            response.end();
        });

};
