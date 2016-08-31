"use strict";

var BASE_URL = "/file://",
    fs = require("fs"),
    path = require("path");

module.exports = function (request, response, next) {

    if (0 !== request.url.indexOf(BASE_URL)) {
        return next();
    }

    var filePath = path.join(request.url.substr(BASE_URL.length));

    if (request.method === "GET") {
        return response.end(fs.readFileSync(filePath));
    }

};
