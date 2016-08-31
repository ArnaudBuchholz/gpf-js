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
        // Read
        return response.end(fs.readFileSync(filePath));

    } else if (request.method === "PUT") {
        // Update
        request.on("data", function (data) {
            fs.writeFileSync(filePath, data);
            response.end();
        });
    }

};
