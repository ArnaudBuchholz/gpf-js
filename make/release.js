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

let
    version,
    gitHubToken,
    gh,
    versionMilestone,
    versionTitle,
    error;

const
    projectUrl = "https://github.com/ArnaudBuchholz/gpf-js/",
    publicationUrl = "https://arnaudbuchholz.github.io/gpf/",
    publicationGit = "https://github.com/ArnaudBuchholz/ArnaudBuchholz.github.io.git",
    publicationRepo = "tmp/publish",
    inquirer = require("inquirer"),
    GitHub = require("github-api"),
    ConfigFile = require("./configFile.js"),
    configFile = new ConfigFile(true),
    fs = require("fs-extra"),
    pkgText = fs.readFileSync("package.json").toString(),
    pkg = JSON.parse(pkgText),
    pkgVersion = pkg.version,

    testMode = process.argv.some(arg => arg === "-test"),
    noBuild = process.argv.some(arg => arg === "-noBuild"),

    trimLeadingLF = buffer => {
        let text = buffer.toString(),
            lengthMinus1 = text.length - 1;
        if (text.lastIndexOf("\n") === lengthMinus1) {
            return text.substr(0, lengthMinus1);
        }
        return  text;
    },

    spawnProcess = (command, params) => new Promise(function (resolve, reject) {
        let childProcess = require("child_process").spawn(command, params),
            output = [];
        childProcess.stdout.on("data", buffer => {
            console.log(trimLeadingLF(buffer));
            output.push(buffer);
        });
        childProcess.stderr.on("data", buffer => {
            console.error(trimLeadingLF(buffer));
            output.push(buffer);
        });
        childProcess.on("error", reject);
        childProcess.on("close", code => code
            ? reject(new Error(`${command} ${params.join(" ")} failed`))
            : resolve(output.join("")));
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

    spawnGit = params => spawnProcess("git", params),

    publishVersion = () => spawnGit(["commit", "-a", "-m", `Release v${version}`])
        .then(() => spawnGit(["push"]))
        .then(() => spawnGit(["-C", publicationRepo, "add", "--all"]))
        .then(() => spawnGit(["-C", publicationRepo, "commit", "-a", "-m", `Release v${version}`]))
        .then(() => spawnGit(["-C", publicationRepo, "push"]))
        .then(() => gh.getIssues("ArnaudBuchholz", "gpf-js").editMilestone(versionMilestone.number, {
            state: "closed"
        }))
        .then(() => gh.getRepo("ArnaudBuchholz", "gpf-js").createRelease({
            tag_name: `v${version}`,
            name: versionTitle
        }))
        .then(() => console.log(`Version ${version} released.`)),

    throwError = x => {
        throw new Error(x);
    },
    logError = x => console.error(`*** ${x} ***`),

    setupQuestions = [],
    configGitHub = configFile.content.github || {};

version = pkgVersion;
error = testMode ? logError : throwError;
if (testMode) {
    console.warn("*** Test mode ***");
}
if (noBuild) {
    console.warn("*** No build ***");
}

if (version.includes("-")) {
    version = version.split("-")[0];
}

setupQuestions.push({
    type: "input",
    name: "version",
    message: "Please check the version: ",
    "default": version
});

if (configGitHub.token) {
    gitHubToken = configGitHub.token;
} else {
    setupQuestions.push({
        type: "input",
        name: "githubUser",
        message: "GitHub user: ",
        "default": configGitHub.user
    }, {
        type: "password",
        name: "githubPassword",
        message: "GitHub password: "
    });
}

inquirer.prompt(setupQuestions)
    .then(answers => {
        version = answers.version;
        console.log("Releasing version: " + version);
        console.log("Authenticating on GitHub...");
        if (gitHubToken) {
            gh = new GitHub({
                token: gitHubToken
            });
        } else {
            gh = new GitHub({
                username: answers.githubUser,
                password: answers.githubPassword
            });
        }
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
            error("No corresponding milestone found");
        }
        versionTitle = versionMilestone.title.split(":")[1].trim();
        console.log(`Milestone: ${versionMilestone.title}`);
        console.log(`Remaining open issues: ${versionMilestone.open_issues}`);
        if (versionMilestone.open_issues) {
            error("Issues remaining in the milestone");
        }
    })
    .then(() => spawnGit(["status", "--porcelain"])
        .then(output => output.length ? error("Process any pending changes first") : 0)
    )
    .then(() => console.log("Cloning publication repository..."))
    .then(() => spawnGrunt("clean:publish"))
    .then(() => spawnGit(["clone", publicationGit, publicationRepo, "-q"]))
    .then(() => {
        if (pkgVersion !== version) {
            console.log("Updating package.json version...");
            fs.writeFileSync("package.json", pkgText.replace(pkgVersion, version));
        }
        return noBuild ? 0 : spawnGrunt("make");
    })
    .then(() => {
        console.log("Updating build/releases.json...");
        const
            now = new Date(),
            z = x => x < 10 ? "0" + x : x.toString(),
            releases = JSON.parse(fs.readFileSync("build/releases.json").toString());
        releases.push({
            version: version,
            label: versionTitle,
            date: `${now.getFullYear()}-${z(now.getMonth() + 1)}-${z(now.getDay() + 1)}`,
            notes: "",
            milestone: versionMilestone.number,
            metrics: JSON.parse(fs.readFileSync("tmp/releaseMetrics.json").toString())
        });
        fs.writeFileSync("build/releases.json", JSON.stringify(releases, null, 4));
        console.log("Updating README.md...");
        const
            readmeLines = fs.readFileSync("README.md").toString().split("\n"),
            indexOfVersions = readmeLines.indexOf("## Versions"),
            indexOfCredits = readmeLines.indexOf("## Credits");
        readmeLines.splice(indexOfVersions + 2, indexOfCredits - indexOfVersions - 3,
            "Date | Version | Label | Release | Debug | Flavors\n------ | ------ | ----- | ----- | ----- | -----",
            releases.reverse().map(release => `${release.date} | `
                        + `[${release.version}](${projectUrl}tree/v${release.version}) | ${release.label} | `
                        + `[lib](${publicationUrl}${release.version}/gpf.js) / `
                        + `[test](${publicationUrl}test.html?release=${release.version}) | `
                        + `[lib](${publicationUrl}${release.version}/gpf-debug.js) / `
                        + `[test](${publicationUrl}test.html?debug=${release.version}) | `
                        + Object.keys(configFile.content.files.flavors)
                            .filter(flavor => configFile.content.files.flavors[flavor].since <= release.version)
                            .map(flavor => `[${flavor}](${publicationUrl}${release.version}/gpf-${flavor}.js)`)
                            .join(" / ")
            ).join("\n")
        );
        fs.writeFileSync("README.md", readmeLines.join("\n"));
        return noBuild ? 0 : spawnGrunt("jsdoc:public");
    })
    .then(() => spawnGrunt("publish"))
    .then(() => spawnGrunt("zip:platoHistory"))
    .then(() => testMode
        ? console.warn("No GIT publishing in test mode")
        : publishVersion()
    )
    .then(() => fs.copySync("build/tests.js", `test/legacy/${version}.js`))
    .then(() => testMode
        ? console.warn("No legacy/test commit in test mode")
        : Promise.resolve()
            .then(() => spawnGit(["add", `test/legacy/${version}.js`]))
            .then(() => spawnGit(["commit", "-a", "-m", `Tests of v${version}`]))
            .then(() => spawnGit(["push"]))
    )
    .then(() => testMode
        ? console.warn("No NPM publish in test mode")
        : spawnProcess("npm.cmd", ["publish"]))
    .then(() => inquirer.prompt([{
        type: "input",
        name: "version",
        message: "Please check the version: ",
        "default": version
            .split(".")
            .map((digit, index) => 2 === index ? parseInt(digit, 10) + 1 : digit)
            .join(".") + "-alpha"
    }]))
    .then(answers => {
        fs.writeFileSync("package.json", pkgText.replace(pkgVersion, answers.version));
        version = answers.version;
        return spawnGrunt("exec:version");
    })
    .then(() => testMode
        ? console.warn("No new version commit in test mode")
        : Promise.resolve()
            .then(() => spawnGit(["commit", "-a", "-m", `Initialization of v${version}`]))
            .then(() => spawnGit(["push"]))
    )
    .catch(console.error);
