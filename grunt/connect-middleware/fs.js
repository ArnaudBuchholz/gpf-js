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

    _read = (response, filePath) => {
        fs.readFile(filePath, (err, data) => _succeeded(response, err, data));
    },

    _readFolder = (response, folderPath) => {
        fs.readdir(folderPath, (err, files) => _succeeded(response, err, JSON.stringify(files)));
    },

    _write = ({request, response, file}) => {
        const
            filePath = file.path,
            data = [],
            flag = request.method === "POST" ? "w" : "a";
        request
            .on("data", chunk => {
                data.push(chunk);
            })
            .on("end", () => {
                fs.writeFile(filePath, Buffer.concat(data), {flag}, err => _succeeded(response, err));
            });
    },

    _handlers = {

        OPTIONS: ({response}) => {
            response.end();
        },

        GET: ({response, file}) => {
            if (file.stats.isDirectory()) {
                _readFolder(response, file.path);
            } else {
                _read(response, file.path);
            }
        },

        DELETE: ({response, file}) => {
            fs.unlink(file.path, err => _succeeded(response, err));
        },

        POST: _write,

        PUT: _write

    };

module.exports = (request, response, next) => {

    if (!request.url.startsWith(BASE_URL)) {
        return next();
    }

    var method = request.method,
        basePath = path.join(__dirname, "../.."),
        filePath;

    if (!["GET", "PUT", "POST", "OPTIONS", "DELETE"].includes(method)) {
        response.statusCode = 500;
        response.end("Invalid method");
        return;
    }

    filePath = path.join(basePath, request.url.substring(BASE_URL.length));
    if (path.relative(basePath, filePath).includes("..")) {
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
        const file = {
            path: filePath,
            stats: stats
        };
        _handlers[method]({request, response, file});
    });

};
