"use strict";

var childProcess = require("child_process"),
    BASE_URL = "/grunt://",
    fs = require("fs"),
    path = require("path"),
    // https://en.wikipedia.org/wiki/ANSI_escape_code
    colors = ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"];

module.exports = function (request, response, next) {

    if (0 !== request.url.indexOf(BASE_URL)) {
        return next();
    }

    var parameters = request.url.substr(BASE_URL.length),
        process = childProcess.exec("grunt", parameters.split(" "));

    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.write("<html><head><title>grunt ");
    response.write(parameters);
    response.write("</title><link rel=\"stylesheet\" type=\"text/css\" href=\"/res/console.css\"></head><body><pre>\n");

    process.stdout.on("data", function (text) {
        console.log(text);
        text.toString().split("\n").forEach(function (line) {
            line = line
                .split("&").join("&amp;")
                .split("<").join("&lt;")
                .split(">").join("&gt;")
                .split("\x1B[1m").join("<b>").split("\x1B[22m").join("</b>")
                .split("\x1B[4m").join("<u>").split("\x1B[24m").join("</u>")
                .split("\x1B[39m").join("</span>");
            colors.forEach(function (name, index) {
                line = line
                    .split("\x1B[3" + index + "m").join("<span class=\"" + name + "\">")
                    .split("\x1B[9" + index + "m").join("<span class=\"" + name + " bright\">")
            });
            response.write(line);
            response.write("\n");
        });
    });

    process.on("close", function (code) {
        response.end("\n</pre></body></html>");
    });

};
