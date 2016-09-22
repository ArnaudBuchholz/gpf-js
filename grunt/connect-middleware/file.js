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

    var filePath = path.join(__dirname, "../..", request.url.substr(BASE_URL.length)),
        isOptionsMethod = "OPTIONS" === request.method;

    fs.stat(filePath, function (err, stats) {
        if ((err || !stats.isFile()) && (-1 !== ["GET", "PUT", "OPTIONS"].indexOf(request.method))) {
            response.statusCode = 404;
            if (isOptionsMethod) {
                response.end();
            } else {
                response.end("File not found");
            }
            return;
        }
        if (isOptionsMethod) {
            response.end();

        } else if ("GET" === request.method) {
            response.end(fs.readFileSync(filePath));

        } else {
            _dump(request, response, filePath);
        }
    });

};
