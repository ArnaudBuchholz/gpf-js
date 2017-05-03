"use strict";
/*jshint node: true*/
/*jshint camelcase: false*/ // Because of GitHub API
/*eslint-env node*/
/*eslint-disable camelcase*/ // Because of GitHub API

/*
 * STEPS:
 * - Check version number
 * - Update package.json (if needed)
 * - Check GitHub milestones to identify the milestone details and check that all issues are closed
 * - Update README.md
 * - Make
 * - Copy tmp/plato/report.history.* to build/ (grunt copy:releasePlatoHistory)
 * - commit & push
 * - Create release on GitHub
 * - Copy build/tests.js into test/host/legacy/{version}.js
 * - commit & push
 * - npm publish
 */

const
    inquirer = require("inquirer"),
    GitHub = require("github-api"),
    ConfigFile = require("./configFile.js"),
    configFile = new ConfigFile(),
    fs = require("fs-extra"),
    pkgText = fs.readFileSync("package.json").toString(),
    pkg = JSON.parse(pkgText),
    pkgVersion = pkg.version,

    trimLeadingLF = buffer => {
        let text = buffer.toString(),
            lengthMinus1 = text.length - 1;
        if (text.lastIndexOf("\n") === lengthMinus1) {
            return text.substr(0, lengthMinus1);
        }
        return  text;
    },

    spawnProcess = (command, params) => new Promise(function (resolve, reject) {
        let childProcess = require("child_process").spawn(command, params);
        childProcess.stdout.on("data", buffer => console.log(trimLeadingLF(buffer)));
        childProcess.stderr.on("data", buffer => console.error(trimLeadingLF(buffer)));
        childProcess.on("error", reject);
        childProcess.on("close", code => code ? reject(new Error(`${command} ${params.join(" ")} failed`)) : resolve());
    }),

    spawnGrunt = command => {
        let grunt;
        if (/^win/.test(process.platform)) {
            grunt = "grunt.cmd";
        } else {
            grunt = "grunt";
        }
        return spawnProcess(grunt, [command]);
    },

    spawnGit = params => spawnProcess("git", params)
    ;

let
    version = pkgVersion,
    gh,
    versionMilestone,
    versionTitle;

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
    message: "GitHub password: "

}])
    .then(answers => {
        version = answers.version;
        if (pkgVersion !== version) {
            console.log("Updating package.json version...");
            fs.writeFileSync("package.json", pkgText.replace(pkgVersion, version));
        }
        console.log("Releasing version: " + version);
        console.log("Authenticating on GitHub...");
        gh = new GitHub({
            username: answers.githubUser,
            password: answers.githubPassword
        });
        let user = gh.getUser();
        return user.getProfile();
    })
    .then(reqProfile => {
        console.log(`Welcome ${reqProfile.data.name}.`);
        return gh.getIssues("ArnaudBuchholz", "gpf-js").listMilestones();
    })
    .then(reqMilestones => {
        versionMilestone = reqMilestones.data.filter(candidate => candidate.title.includes(version))[0];
        if (!versionMilestone) {
            throw new Error("No corresponding milestone found");
        }
        versionTitle = versionMilestone.title.split(":")[1].trim();
        console.log(`Milestone: ${versionMilestone.title}`);
        console.log(`Remaining open issues: ${versionMilestone.open_issues}`);
        if (versionMilestone.open_issues) {
            throw new Error("Issues remaining in the milestone");
        }
        let readmeLines = fs.readFileSync("README.md").toString().split("\n"),
            indexOfCredits = readmeLines.indexOf("## Credits"),
            lastVersionLineIndex = indexOfCredits - 2,
            lastVersionLine = readmeLines[lastVersionLineIndex];
        if (!lastVersionLine.startsWith(`[${version}]`)) {
            console.log("Adding version line in README.md...");
            readmeLines.splice(++lastVersionLineIndex, 0, `[${version}](https://github.com/ArnaudBuchholz/gpf-js/tree/`
                + `v${version}) / [doc](https://arnaudbuchholz.github.io/gpf/${version}/doc/index.html) | `
                + `${versionTitle} | [lib](https://arnaudbuchholz.github.io/gpf/${version}/gpf.js) / [test](https://`
                + `arnaudbuchholz.github.io/gpf/test.html?release=${version}) | [lib](https://arnaudbuchholz.github.io/`
                + `gpf/${version}/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=`
                + `${version}) | [plato](https://arnaudbuchholz.github.io/gpf/${version}/plato/index.html)`
            );
            fs.writeFileSync("README.md", readmeLines.join("\n"));
        }
        return spawnGrunt("make");
    })
    .then(() => spawnGrunt("copy:releasePlatoHistory"))
    .then(() => spawnGit(["commit", "-a", "-m", `Release v${version}`]))
    .then(() => spawnGit(["push"]))
    .then(() => gh.getIssues("ArnaudBuchholz", "gpf-js").editMilestone(versionMilestone.number, {
        state: "closed"
    }))
    .then(() => gh.getRepo("ArnaudBuchholz", "gpf-js").createRelease({
        tag_name: `v${version}`,
        name: versionTitle
    }))
    .then(() => console.log(`Version ${version} released.`))
    .then(() => fs.copySync("build/tests.js", `test/legacy/${version}.js`))
    .then(() => spawnGit(["add", `test/legacy/${version}.js`]))
    .then(() => spawnGit(["commit", "-a", "-m", `Tests of v${version}`]))
    .then(() => spawnGit(["push"]))
    .then(() => spawnProcess("npm", ["publish"]))
    .catch(error => console.error(error));
