"use strict";

const
    childProcess = require("child_process"),
    url = require("url"),
    BASE_URL = "/grunt/",
    // https://en.wikipedia.org/wiki/ANSI_escape_code
    colors = ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"],

    _toHtml = content => {
        // Assuming content is generated properly...
        let htmlContent = content
            .split("&").join("&amp;")
            .split("<").join("&lt;")
            .split(">").join("&gt;")
            .split("█").join("&marker;")
            // Bold or increased intensity
            .split("\x1B[1m").join("<b>").split("\x1B[22m").join("</b>")
            // Faint (decreased intensity)
            .split("\x1B[2m").join("")
            // Underline: Single
            .split("\x1B[4m").join("<u>").split("\x1B[24m").join("</u>")
            // Default text color (foreground)
            .split("\x1B[39m").join("</span>")
            // Reset / Normal
            .split("\x1B[0m").join("</span>");
        colors.forEach((name, index) => {
            htmlContent = htmlContent
                .split(`\x1B[3${index}m`).join(`<span class="${name}">`)
                .split(`\x1B[3${index};1m`).join(`<span class="${name}">`)
                .split(`\x1B[9${index}m`).join(`<span class="${name} bright">`);
        });
        return htmlContent;
    };

module.exports = (request, response, next) => {

    if (!request.url.startsWith(BASE_URL)) {
        return next();
    }

    var parameters = url.parse(request.url).pathname.substring(BASE_URL.length),
        process = childProcess.exec("grunt " + parameters),
        step = 0;

    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.write([
        "<html><head><title>grunt ",
        parameters,
        "</title>",
        "<link rel=\"stylesheet\" type=\"text/css\" href=\"/res/console.css\">",
        "</head>",
        "<body onload=\"var w=window,t=w.opener||w.parent;if(t){t.location.hash=new Date().getTime()}\">",
        "<pre>\n"
    ].join(""));

    process.stdout.on("data", text => {
        console.log(text);
        response.write(_toHtml(text) + `<a name="${++step}" /><script>location.hash="${step}";</script>`);
    });

    process.on("close", () => {
        response.end("\n</pre></body></html>");
    });

};
