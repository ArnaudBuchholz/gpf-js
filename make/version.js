"use strict";

var fs = require("fs"),
    verbose = process.argv[2] === "-verbose",
    packageJson = JSON.parse(fs.readFileSync("package.json").toString()),
    sourcesJson = JSON.parse(fs.readFileSync("src/sources.json").toString()),
    packageVersion = packageJson.version,
    version = packageVersion.split("-")[0],
    bootSrc = fs.readFileSync("src/boot.js").toString(),
    bootVersionMatch = (/_gpfVersion += +\"(.*)\"/).exec(bootSrc),
    bootVersion = bootVersionMatch[1];

if (verbose) {
    console.log("Version: " + version);
    console.log("Package version: " + packageVersion);
    console.log("Boot version: " + bootVersion);
}

if (bootVersion !== packageVersion) {
    bootSrc = bootSrc.replace(bootVersionMatch[0], "_gpfVersion = \"" + packageVersion + "\"");
    fs.writeFileSync("src/boot.js", bootSrc);
    console.log("src/boot.js updated" + bootVersion);
}

function _injectSinceComment (source, jsdocComment, lastIndex) {
    var newComment = jsdocComment.split("\n"),
        pos,
        len;
    if (newComment.length === 1) {
        // Need to find current indentation
        pos = source.content.substr(0, lastIndex).lastIndexOf("\n") + 1;
        len = lastIndex - jsdocComment.length - pos;
        return [
            "/**",
            " * " + jsdocComment.substr(3, jsdocComment.length - 5).trim(),
            " * @since " + version,
            " */"
        ].join("\n" + source.content.substr(pos, len));
    }
    newComment.splice(-1, 0, newComment[newComment.length - 1].replace("*/", "* @since " + version));
    return newComment.join("\n");
}

function _removeSinceComment (jsdocComment) {
    return jsdocComment
        .split("\n")
        .filter(function (line) {
            return line.indexOf("@since") === 0;
        })
        .join("\n");
}

function _processCommentForSince (source, jsdocCommentMatch, lastIndex) {
    var jsdocComment,
        hasSince,
        newComment;
    jsdocComment = jsdocCommentMatch[0];
    if (jsdocComment.indexOf("@lends") > -1) {
        return false;
    }
    newComment = undefined;
    hasSince = jsdocComment.indexOf("@since") > -1;
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
}

var _reJsdocComment = /(?:\/\*\*(?:[^*]|\s|\*[^/])*\*\/)/g;

function _handleSinceInSource (source) {
    var jsdocCommentMatch,
        modified = false,
        fileName;
    source.content = fs.readFileSync("src/" + source.name + ".js").toString();
    _reJsdocComment.lastIndex = 0;
    jsdocCommentMatch = _reJsdocComment.exec(source.content);
    while (jsdocCommentMatch) {
        modified = _processCommentForSince(source, jsdocCommentMatch, _reJsdocComment.lastIndex) || modified;
        jsdocCommentMatch = _reJsdocComment.exec(source.content);
    }
    if (modified) {
        fileName = "src/" + source.name + ".js";
        fs.writeFileSync(fileName, source.content);
        console.log(fileName + " updated");
    }
}

sourcesJson.forEach(_handleSinceInSource);
