"use strict";
/*jshint node: true*/
/*eslint-env node*/

/*
 * STEPS:
 * - Check version number
 * - Check GitHub milestones to identify the milestone and check that all issues are closed
 * - Update package.json
 *
 */

const
    inquirer = require("inquirer"),
    ConfigFile = require("./configFile.js"),
    configFile = new ConfigFile(),
    fs = require("fs"),
    pkg = JSON.parse(fs.readFileSync("package.json")),
    https = require("https"),
    url = require("url"),

    httpsGet = options => new Promise((resolve, reject) =>
        https.get(options, res => res.statusCode !== 200 ? reject(res) : resolve(res))
            .on("error", reject)
    ),

    parseHttpResponseAsJSON = response => new Promise((resolve, reject) => {
        response.setEncoding("utf8");
        let rawData = [];
        response
            .on("data", chunk => rawData.push(chunk))
            .on("end", () => {
                try {
                    resolve(JSON.parse(rawData.join("")));
                } catch (e) {
                    reject(e);
                }
            });
    })
    ;

let
    version = pkg.version;
if (version.includes("-")) {
    version = version.split("-")[0];
}

inquirer.prompt([{
    type: "input",
    name: "version",
    message: "Please check the version: ",
    "default": version
}])
    .then(answers => {
        version = answers.version;
        console.log("Releasing version: " + version);
        console.log("Getting GitHub milestones...");
        return httpsGet(Object.assign({
            auth: `${configFile.content.github.usr}:${configFile.content.github.pwd}`,
        }, url.parse("https://api.github.com/repos/ArnaudBuchholz/gpf-js/milestones")))
            .then(parseHttpResponseAsJSON);
    })
    .then(milestones => {
        milestones.filter(milestone => milestone.title.includes(version));
        if (1 === milestones.length) {
            return Promise.resolve(milestones[0]);
        }
        throw new Error("GitHub milestone not found");
    }, response => {
        console.error(`${response.statusCode} ${response.statusMessage}`);
    })
    .then(milestone => {
        console.log(`GitHub milestone: ${milestone.title}`);
    })
    .catch(error => console.error(error))
;
