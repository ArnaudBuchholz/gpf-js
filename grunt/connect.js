"use strict";

module.exports = {
    server: {
        options: {
            port: configuration.httpPort,
            hostname: "*",
            open: true,
            middleware: function (connect, options, middlewares) {

                var MIDDLEWARE_FOLDER = "connect-middleware",
                    fs = require("fs"),
                    path = require("path");
                fs.readdirSync(path.join(__dirname, MIDDLEWARE_FOLDER)).forEach(function (fileName) {
                    middlewares.unshift(require("./" + MIDDLEWARE_FOLDER + "/" + fileName));
                });

                return middlewares;
            }
        }
    }
};
