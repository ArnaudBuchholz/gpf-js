"use strict";

const
    fs = require("fs"),
    path = require("path"),
    BASE_URL = "/flavors/",

    _error = (response, err) => {
        response.statusCode = 500;
        response.end(err.toString());
    },

    _flavor = flavorPath => new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, "../../make/flavor", flavorPath), (err, content) => {
            if (err) {
                reject(err);
            } else {
                resolve(`\n${path.basename(flavorPath, ".json")}: ${content}`);
            }
        });
    });

module.exports = (request, response, next) => {

    if (!request.url.startsWith(BASE_URL)) {
        return next();
    }

    response.setHeader("Content-Type", "application/javascript; charset=utf-8");
    response.write("var gpfFlavors = {\n");
    fs.readdir(path.join(__dirname, "../../make/flavor"), (err, data) => {
        if (err) {
            return _error(response, err);
        }
        Promise.all(data.map(_flavor))
            .then(flavors => {
                response.write(flavors.join(","));
                response.write("\n};");
                response.end();
            }, reason => _error(response, reason));
    });

};
