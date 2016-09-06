"use strict";

var BASE_URL = "/file/",
    fs = require("fs"),
    path = require("path");

function _dump (request, response, filePath) {
    var data = [];
    request
        .on("data", function (chunk) {
            data.push(chunk);
        })
        .on("end", function () {
            fs.writeFile(filePath, Buffer.concat(data), function (err) {
                if (err) {
                    response.statusCode = 500;
                }
                response.end();
            });
        });
}

module.exports = function (request, response, next) {

    if (0 !== request.url.indexOf(BASE_URL)) {
        return next();
    }

    var filePath = path.join(__dirname, "../..", request.url.substr(BASE_URL.length));

    fs.stat(filePath, function (err, stats) {
        if ((err || !stats.isFile()) && ("GET" === request.method || "PUT" === request.method)) {
            response.statusCode = 404;
            response.end("File not found");
            return;
        }
        if ("GET" === request.method) {
            response.end(fs.readFileSync(filePath));
        } else {
            _dump(request, response, filePath);
        }
    });

};
