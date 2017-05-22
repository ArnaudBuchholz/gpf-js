"use strict";

var BASE_URL = "/fs/",
    fs = require("fs"),
    path = require("path");

function _read (request, response, filePath) {
    response.end(fs.readFileSync(filePath));
}

function _succeeded (response, err) {
    if (err) {
        response.statusCode = 500;
        response.end(err.toString());
        return false;
    }
    return true;
}

function _readFolder (request, response, folderPath) {
    fs.readdir(folderPath, function (err, files) {
        if (_succeeded(response, err)) {
            response.end(JSON.stringify(files));
        }
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
                if (_succeeded(response, err)) {
                    response.end();
                }
            });
        });
}

function _delete (response, filePath) {
    fs.unlink(filePath, function (err) {
        if (_succeeded(response, err)) {
            response.end();
        }
    });
}

module.exports = function (request, response, next) {

    if (0 !== request.url.indexOf(BASE_URL)) {
        return next();
    }

    var method = request.method,
        basePath = path.join(__dirname, "../.."),
        filePath;

    if (-1 === ["GET", "PUT", "POST", "OPTIONS", "DELETE"].indexOf(method)) {
        response.statusCode = 500;
        response.end("Invalid method");
        return;
    }

    filePath = path.join(basePath, request.url.substr(BASE_URL.length));
    if (-1 !== path.relative(basePath, filePath).indexOf("..")) {
        response.statusCode = 403;
        response.end("Path is forbidden: " + path.relative(__dirname, filePath));
        return;
    }

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


        } else if ("DELETE" === request.method) {
            _delete(response, filePath);

        } else { // PUT & POST
            _write(request, response, filePath);
        }
    });

};
