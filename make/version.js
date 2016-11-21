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
    console.log("Package version: " + packageJson.version);
    console.log("Boot version   : " + bootVersion);
    bootSrc = bootSrc.replace(bootVersionMatch[0], "_gpfVersion = \"" + packageVersion + "\"");
    fs.writeFileSync("src/boot.js", bootSrc);
    console.log("src/boot.js updated" + bootVersion);
}

var _reJsdocComment = /(?:\/\*\*(?:[^*]|\s|\*[^/])*\*\/)/g;

sourcesJson.forEach(function (source) {
    var sourceContent = fs.readFileSync("src/" + source.name + ".js").toString(),
        jsdocCommentMatch,
        jsdocComment,
        modified = false,
        hasSince,
        newComment,
        pos,
        len,
        indent,
        fileName;
    _reJsdocComment.lastIndex = 0;
    jsdocCommentMatch = _reJsdocComment.exec(sourceContent);
    while (jsdocCommentMatch) {
        jsdocComment = jsdocCommentMatch[0];
        if (jsdocComment.indexOf("@lends") > -1) {
            jsdocCommentMatch = _reJsdocComment.exec(sourceContent);
            continue;
        }
        newComment = undefined;
        hasSince = jsdocComment.indexOf("@since") > -1;
        if (source.load !== false) {
            if (!hasSince) {
                // Inject @since
                newComment = jsdocComment.split("\n");
                if (newComment.length === 1) {
                    // Need to find current indentation
                    pos = sourceContent.substr(0, _reJsdocComment.lastIndex).lastIndexOf("\n") + 1;
                    len = _reJsdocComment.lastIndex - jsdocComment.length - pos;
                    indent = sourceContent.substr(pos, len);
                    newComment = indent + [
                        "/**",
                        " * " + jsdocComment.substr(3, jsdocComment.length - 5).trim(),
                        " * @since " + version,
                        " */"
                    ].join("\n" + indent);
                } else {
                    newComment.splice(-1, 0, newComment[newComment.length -1].replace("*/", "* @since " + version));
                    newComment = newComment.join("\n");
                }
            }
        } else if (hasSince) {
            // Remove @since
            newComment = jsdocComment
                .split("\n")
                .filter(function (line) {
                    return line.indexOf("@since") === 0;
                })
                .join("\n");
        }
        if (newComment) {
            sourceContent = sourceContent.replace(jsdocComment, newComment);
            // console.log(newComment);
            modified = true;
        }
        jsdocCommentMatch = _reJsdocComment.exec(sourceContent);
    }
    if (modified) {
        fileName = "src/" + source.name + ".js";
        fs.writeFileSync(fileName, sourceContent);
        console.log(fileName + " updated");
    }
});
