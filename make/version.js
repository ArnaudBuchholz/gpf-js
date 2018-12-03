"use strict";

const
    FIRST_CMDLINE_PARAM = 2,
    GENERIC_ERROR = -1,
    {readFileSync, writeFileSync} = require("fs"),
    verbose = process.argv[FIRST_CMDLINE_PARAM] === "-verbose",
    packageJson = JSON.parse(readFileSync("package.json").toString()),
    sourcesJson = JSON.parse(readFileSync("src/sources.json").toString()),
    packageVersion = packageJson.version,
    releaseVersion = (/\d+\.\d+\.\d+/).exec(packageVersion).toString(),
    bootSrc = readFileSync("src/boot.js").toString(),
    VERSION_LINE = 0,
    VERSION_CAPTURING_GROUP = 1,
    bootVersionMatch = (/_gpfVersion += +"(.*)"/).exec(bootSrc),
    bootVersion = bootVersionMatch[VERSION_CAPTURING_GROUP];

if (verbose) {
    console.log(`Release version : ${releaseVersion}
Package version : ${packageVersion}
Boot version    : ${bootVersion}`);
}

if (bootVersion !== packageVersion) {
    writeFileSync("src/boot.js", bootSrc.replace(bootVersionMatch[VERSION_LINE], `_gpfVersion = "${packageVersion}"`));
    console.log(`Version in src/boot.js updated to ${packageVersion}`);
}

const
    JSDOC_START = "/**",
    JSDOC_END = "*/",

    _injectSince = (jsdocComment) => {
        const
            ONE_LINE_ONLY = 1,
            BEFORE_LAST = -1,
            START = 0,
            KEEP = 0,
            lines = jsdocComment.split("\n"),
            lastLine = [...lines].pop(),
            firstLineIsEmpty = jsdocComment.startsWith("\n");
        if (firstLineIsEmpty) {
            lines.shift();
        }
        if (lines.length === ONE_LINE_ONLY) {
            const
                jsdocStart = lastLine.indexOf(JSDOC_START),
                jsdocAfterStart = jsdocStart + JSDOC_START.length,
                jsdocEnd = lastLine.indexOf(JSDOC_END),
                indent = lastLine.substring(START, jsdocStart);
            lines.splice(START, lines.length,
                `${indent}${JSDOC_START}`,
                `${indent} * ${lastLine.substring(jsdocAfterStart, jsdocEnd).trim()}`,
                `${indent} * @since ${releaseVersion}`,
                `${indent} ${JSDOC_END}`
            );
        } else {
            // Multi line comment
            lines.splice(BEFORE_LAST, KEEP, lastLine.replace(JSDOC_END, `* @since ${releaseVersion}`));
        }
        if (firstLineIsEmpty) {
            lines.unshift("");
        }
        return lines.join("\n");
    },

    _processJsdocComment = (jsdocComment) => {
        if (jsdocComment.includes("@lends") || jsdocComment.includes("@since")) {
            return jsdocComment; // ignore
        }
        return _injectSince(jsdocComment);
    },

    _handleSinceInSource = (source) => {
        const fileName = `src/${source.name}.js`;
        try {
            source.content = readFileSync(fileName).toString();
        } catch (e) {
            console.error(e);
            process.exit(GENERIC_ERROR);
        }
        const modified = source.content.replace(/(^|\n)( |\t)*\/\*\*([^*]|\s|\*[^/])*\*\//g, _processJsdocComment);
        if (modified !== source.content) {
            writeFileSync(fileName, modified);
            console.log(fileName + " updated");
        }
    };

sourcesJson.forEach(_handleSinceInSource);
