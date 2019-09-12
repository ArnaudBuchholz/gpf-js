"use strict";

const options = {
    port: configuration.serve.httpPort,
    hostname: "localhost",
    middleware: function (connect, options, middlewares) {

        var MIDDLEWARE_FOLDER = "connect-middleware",
            fs = require("fs"),
            path = require("path");
        fs.readdirSync(path.join(__dirname, MIDDLEWARE_FOLDER)).forEach(function (fileName) {
            middlewares.unshift(require("./" + MIDDLEWARE_FOLDER + "/" + fileName));
        });

        return middlewares;
    }
};

module.exports = {
    serve: {
        options
    },
    "serve-and-wait": {
        options: {
          useAvailablePort: true,
          keepalive: true,
          ...options
        }
    }
};
