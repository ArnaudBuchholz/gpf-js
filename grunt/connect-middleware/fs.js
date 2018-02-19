"use strict";

const
    BASE_URL = "/fs/",
    fs = require("fs"),
    path = require("path"),

    _succeeded = (response, err, answer) => {
        if (err) {
            response.statusCode = 500;
            response.end(err.toString());
            return false;
        }
        response.end(answer);
        return true;
    },

    _read = (request, response, filePath) => {
        fs.readFile(filePath, (err, data) => _succeeded(response, err, data));
    },

    _readFolder = (request, response, folderPath) => {
        fs.readdir(folderPath, (err, files) => _succeeded(response, err, JSON.stringify(files)));
    },

    _write = (request, response, file) => {
        const
            filePath = file.path,
            data = [],
            flag = "POST" === request.method ? "w" : "a";
        request
            .on("data", chunk => {
                data.push(chunk);
            })
            .on("end", () => {
                fs.writeFile(filePath, Buffer.concat(data), {flag: flag}, err => _succeeded(response, err));
            });
    },

    _handlers = {

        OPTIONS: (request, response/*, file*/) => {
            response.end();
        },

        GET: (request, response, file) => {
            if (file.stats.isDirectory()) {
                _readFolder(request, response, file.path);
            } else {
                _read(request, response, file.path);
            }
        },

        DELETE: (request, response, file) => {
            fs.unlink(file.path, err => _succeeded(response, err));
        },

        POST: _write,

        PUT: _write

    };

module.exports = (request, response, next) => {

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

    fs.stat(filePath, (err, stats) => {

        if (err && request.method !== "POST") {
            response.statusCode = 404;
            response.end(err.toString());
            return;
        }

        _handlers[method](request, response, {
            path: filePath,
            stats: stats
        });

    });

};
