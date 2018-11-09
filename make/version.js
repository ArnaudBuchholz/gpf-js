"use strict";

const
    FIRST_CMDLINE_PARAM = 2,
    GENERIC_ERROR = -1,
    fs = require("fs"),
    verbose = process.argv[FIRST_CMDLINE_PARAM] === "-verbose",
    packageJson = JSON.parse(fs.readFileSync("package.json").toString()),
    sourcesJson = JSON.parse(fs.readFileSync("src/sources.json").toString()),
    packageVersion = packageJson.version,
    version = packageVersion.split("-")[0];

let bootSrc = fs.readFileSync("src/boot.js").toString();

const
    bootVersionMatch = (/_gpfVersion += +"(.*)"/).exec(bootSrc),
    bootVersion = bootVersionMatch[1];

if (verbose) {
    console.log("Version: " + version);
    console.log("Package version: " + packageVersion);
    console.log("Boot version: " + bootVersion);
}

if (bootVersion !== packageVersion) {
    bootSrc = bootSrc.replace(bootVersionMatch[0], `_gpfVersion = "${packageVersion}"`);
    fs.writeFileSync("src/boot.js", bootSrc);
    console.log("src/boot.js updated" + bootVersion);
}

const
    JSDOC_START = "/**",
    JSDOC_END = "*/",

    _injectSinceComment = (source, jsdocComment, lastIndex) => {
        const LAST = -1;
        let newComment = jsdocComment.split("\n"),
            pos,
            len;
        if (newComment.length === 1) {
            // Need to find current indentation
            pos = source.content.substr(0, lastIndex).lastIndexOf("\n") + 1;
            len = lastIndex - jsdocComment.length - pos;
            return [
                JSDOC_START,
                ` * ${jsdocComment.substr(JSDOC_START.length,
                    jsdocComment.length - (JSDOC_START + JSDOC_END).length).trim()}`,
                ` * @since ${version}`,
                " " + JSDOC_END
            ].join(`\n${source.content.substr(pos, len)}`);
        }
        newComment.splice(LAST, 0, newComment[newComment.length - 1].replace(JSDOC_END, `* @since ${version}`));
        return newComment.join("\n");
    },

    _removeSinceComment = (jsdocComment) => jsdocComment
        .split("\n")
        .filter(line => !line.includes("@since"))
        .join("\n"),

    _processCommentForSince = (source, jsdocCommentMatch, lastIndex) => {
        let jsdocComment,
            hasSince,
            newComment;
        jsdocComment = jsdocCommentMatch[0];
        if (jsdocComment.includes("@lends")) {
            return false;
        }
        newComment = undefined;
        hasSince = jsdocComment.includes("@since");
        if (source.load !== false) {
            if (!hasSince) {
                newComment = _injectSinceComment(source, jsdocComment, lastIndex);
            }
        } else if (hasSince) {
            newComment = _removeSinceComment(jsdocComment);
        }
        if (newComment) {
            source.content = source.content.replace(jsdocComment, newComment);
            return true;
        }
        return false;
    },

    _reJsdocComment = /(?:\/\*\*(?:[^*]|\s|\*[^/])*\*\/)/g,

    _handleSinceInSource = (source) => {
        let jsdocCommentMatch,
            modified = false,
            fileName = `src/${source.name}.js`;
        try {
            source.content = fs.readFileSync(fileName).toString();
        } catch (e) {
            if (source.load !== false) {
                console.error(e);
                process.exit(GENERIC_ERROR);
            }
        }
        _reJsdocComment.lastIndex = 0;
        jsdocCommentMatch = _reJsdocComment.exec(source.content);
        while (jsdocCommentMatch) {
            modified = _processCommentForSince(source, jsdocCommentMatch, _reJsdocComment.lastIndex) || modified;
            jsdocCommentMatch = _reJsdocComment.exec(source.content);
        }
        if (modified) {
            fs.writeFileSync(fileName, source.content);
            console.log(fileName + " updated");
        }
    };

sourcesJson[0].load = true; // boot must be altered too
sourcesJson.forEach(_handleSinceInSource);
