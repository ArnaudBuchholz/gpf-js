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
    GitHub = require("github-api"),
    ConfigFile = require("./configFile.js"),
    configFile = new ConfigFile(),
    fs = require("fs"),
    url = require("url"),
    pkg = JSON.parse(fs.readFileSync("package.json"))
    ;

let
    version = pkg.version,
    gh;

if (version.includes("-")) {
    version = version.split("-")[0];
}

inquirer.prompt([{
    type: "input",
    name: "version",
    message: "Please check the version: ",
    "default": version
}, {
    type: "input",
    name: "githubUser",
    message: "GitHub user: ",
    "default": configFile.content.github ? configFile.content.github.user : ""
}, {
    type: "password",
    name: "githubPassword",
    message: "GitHub password: ",
// }, {
//     type: "input",
//     name: "githubProxy",
//     message: "GitHub proxy: ",
//     "default": configFile.content.github ? configFile.content.github.proxy : ""

}])
    .then(answers => {
        version = answers.version;
        console.log("Releasing version: " + version);
        // if (answers.githubProxy) {
        //     console.log("Configuring proxy...");
        //     require('global-tunnel').initialize(answers.githubProxy);
        //     console.log("Proxy configured.");
        // }
        console.log("Authenticating on GitHub...");
        gh = new GitHub({
            username: answers.githubUser,
            password: answers.githubPassword,
        });
        let user = gh.getUser();
        return user.getProfile();
    })
    .then(reqProfile => {
        console.log(`Welcome ${reqProfile.data.name}.`);
        return gh.getIssues("ArnaudBuchholz", "gpf-js").listMilestones();
    })
    .then(reqMilestones => {
        var versionMilestone = reqMilestones.data.filter(milestone => milestone.title.includes(version))[0];
        if (!versionMilestone) {
            throw new Error("No corresponding milestone found");
        }
        console.log(`Milestone: ${versionMilestone.title}`);
        console.log(`Remaining open issues: ${versionMilestone.open_issues}`);
        // if (versionMilestone.open_issues) {
        //     throw new Error("Issues remaining in the milestone");
        // }
    })
    //
    //     console.log("Getting GitHub milestones...");
    //     return httpsGet("https://api.github.com/repos/ArnaudBuchholz/gpf-js/milestones")
    //         .then(parseHttpResponseAsJSON);
    // })
    // .then(milestones => {
    //     milestones.filter(milestone => milestone.title.includes(version));
    //     if (1 === milestones.length) {
    //         return Promise.resolve(milestones[0]);
    //     }
    //     throw new Error("GitHub milestone not found");
    // }, response => {
    //     console.error(`${response.statusCode} ${response.statusMessage}`);
    // })
    // .then(milestone => {
    //     console.log(`GitHub milestone: ${milestone.title}`);
    // })
    .catch(error => console.error(error))
;
