"use strict";

const
    childProcess = require("child_process"),
    url = require("url"),
    BASE_URL = "/git/";

module.exports = (request, response, next) => {

    if (0 !== request.url.indexOf(BASE_URL)) {
        return next();
    }

    const
        parameters = url.parse(request.url).pathname.substr(BASE_URL.length),
        process = childProcess.exec("git " + parameters + " --porcelain");

    response.setHeader("Content-Type", "text/plain; charset=utf-8");

    process.stdout.on("data", text => response.write(text));

    process.on("close", () => response.end());

};
