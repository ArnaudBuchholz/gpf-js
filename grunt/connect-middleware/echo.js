"use strict";

const
    BASE_URL = "/echo/",
    url = require("url");

function _process (request, response) {
    let parsedUrl = url.parse(request.url, true),
        statusCode = 200,
        wait = 0,
        headers,
        content;

    if (parsedUrl.query.status) {
        statusCode = parseInt(parsedUrl.query.status, 10);
    }
    if (parsedUrl.query.wait) {
        wait = parseInt(parsedUrl.query.wait, 10);
    }
    if (parsedUrl.query.headers) {
        headers = Object.assign(JSON.parse(parsedUrl.query.headers), request.headers);
    } else {
        headers = request.headers;
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
            if (headers) {
                Object.keys(headers).forEach(name => {
                    response.setHeader(name, headers[name]);
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
}

module.exports = (request, response, next) => {

    if (0 !== request.url.indexOf(BASE_URL)) {
        return next();
    }

    _process(request, response);
};
