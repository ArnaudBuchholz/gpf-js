"use strict";

var BASE_URL = "/fs/",
    fs = require("fs"),
    path = require("path");

function _read (request, response, filePath) {
    response.end(fs.readFileSync(filePath));
}

function _readFolder (request, response, folderPath) {
    fs.readdir(folderPath, function (err, files) {
        if (err) {
            response.statusCode = 500;
            response.end(err.toString());
        }
        response.end(JSON.stringify(files));
    });
}

function _write (request, response, filePath) {
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
    if (-1 === ["GET", "PUT", "POST", "OPTIONS"].indexOf(request.method)) {
        response.statusCode = 500;
        response.end("Invalid method");
        return;
    }

    var method = request.method,
        filePath = path.join(__dirname, "../..", request.url.substr(BASE_URL.length));

    fs.stat(filePath, function (err, stats) {

        if (err && request.method !== "POST") {
            response.statusCode = 404;
            response.end(err.toString());
            return;
        }

        if ("OPTIONS" === method) {
            response.end();

        } else if ("GET" === request.method) {
            if (stats.isDirectory()) {
                _readFolder(request, response, filePath);
            } else {
                _read(request, response, filePath);
            }


        } else {
            _write(request, response, filePath);
        }
    });

};
