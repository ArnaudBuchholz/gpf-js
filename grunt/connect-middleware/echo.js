"use strict";

const
    BASE_URL = "/echo/",
    url = require("url");

module.exports = (request, response, next) => {

    if (0 !== request.url.indexOf(BASE_URL)) {
        return next();
    }

    let parsedUrl = url.parse(request.url, true),
        statusCode = 200,
        wait = 0,
        attributes,
        content;

    if (parsedUrl.query.status) {
        statusCode = parseInt(parsedUrl.query.status, 10);
    }
    if (parsedUrl.query.wait) {
        wait = parseInt(parsedUrl.query.wait, 10);
    }
    if (parsedUrl.query.attributes) {
        attributes = JSON.parse(parsedUrl.query.attributes);
    }
    if (parsedUrl.query.content) {
        content = parsedUrl.query.content;
    } else {
        content = JSON.stringify({
            method: request.method,
            url: request.url
        });
    }

    const
        answer = () => {
            response.statusCode = statusCode;
            if (attributes) {
                Object.keys(attributes).forEach(name => {
                    response.setHeader(name, attributes[name]);
                });
            }
            response.end(content);
        };

    let data = [];
    request
        .on("data", function (chunk) {
            data.push(chunk);
        })
        .on("end", function () {
            if (data.length) {
                content = Buffer.concat(data).toString();
            }
            setTimeout(answer, wait);
        });
};
