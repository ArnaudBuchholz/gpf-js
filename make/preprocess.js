/**
 * Preprocess the JavaScript source and resolve the #ifdef macros
 *
 * @param {String} src
 * @param {Object} defines Dictionary of defines
 * @return {String}
 */
module.exports = function (src, defines) {
    var
        lines = src.split("\n"),
        len = lines.length,
        idx,
        line,
        macro,
        invert,
        ignoreStack = [false],
        ignoreTop,
        ignore;
    // Process each line individually
    for (idx = 0; idx < len; ++idx) {
        line = lines[idx];
        // Current ignore state
        ignoreTop = ignoreStack.length - 1;
        ignore = ignoreStack[ignoreTop];
        if (-1 < line.indexOf("/*#if")) {
            invert = -1 === line.indexOf("/*#ifndef(");
            macro = line.split("(")[1].split(")")[0];
            ignore = gpf.xor(version[macro], invert);
            ignoreStack.push(ignore);
            ignore = true; // Ignore this line

        } else if (-1 < line.indexOf("/*#else")) {
            // Also handles imbricated #if/#endif
            if (ignoreTop === 0 || !ignoreStack[ignoreTop - 1]) {
                ignoreStack[ignoreTop] = !ignore;
            }
            ignore = true; // Ignore this line

        } else if (-1 < line.indexOf("/*#endif")) {
            ignoreStack.pop();
            ignore = true; // Ignore this line
        }
        if (ignore) {
            lines.splice(idx, 1);
            --len;
            --idx;
        }
    }
    return lines.join("\n");
}