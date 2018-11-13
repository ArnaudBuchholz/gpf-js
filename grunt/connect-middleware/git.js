"use strict";

const
    childProcess = require("child_process"),
    url = require("url"),
    BASE_URL = "/git/";

/*
 * status:
 * ?? <path> New file
 *  M <path> Modified
 * AM <path> Added / modified file
 *  D <path> Deleted
 *
 * Recover delete file (before commit):
 * checkout <path>
 *
 * Adding a new file
 * add <path>
 *
 * commit -m "message" <path>
 *
 */

module.exports = (request, response, next) => {

    if (!request.url.startsWith(BASE_URL)) {
        return next();
    }

    const
        parameters = url.parse(request.url).pathname.substr(BASE_URL.length),
        process = childProcess.exec("git " + parameters + " --porcelain");

    response.setHeader("Content-Type", "text/plain; charset=utf-8");

    process.stdout.on("data", text => response.write(text));

    process.on("close", () => response.end());

};
