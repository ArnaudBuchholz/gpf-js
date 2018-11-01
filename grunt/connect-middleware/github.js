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

    if (request.url.indexOf(BASE_URL) !== 0) {
        return next();
    }

    connect()
        .then(github => github.getUser().getProfile())
        .then(profile => {
            return gh.getIssues("ArnaudBuchholz", "gpf-js").listMilestones()
                .then(milestones => {
                    return {
                        profile: profile.data,
                        milestones: milestones.data
                    };
                });
        })
        .then(data => {
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json; charset=utf-8");
            response.write(JSON.stringify(data));
            response.end();

        })["catch"](reason => {
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/json; charset=utf-8");
            response.write(JSON.stringify({
                error: reason.message || reason
            }));
            response.end();
        });

};
