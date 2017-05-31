"use strict";

const
    BASE_URL = "/echo/",
    url = require("url");

function _process (request, response) {
    let parsedUrl = url.parse(request.url, true),
        statusCode = 200,
        wait = 0,
        headers,
        responseText;

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
    if (undefined !== parsedUrl.query.response) {
        responseText = parsedUrl.query.response;
    }

    const
        answer = () => {
            response.statusCode = statusCode;
            if (headers) {
                Object.keys(headers).forEach(name => {
                    response.setHeader(name, headers[name]);
                });
            }
            response.end(responseText);
        };

    let data = [];
    request
        .on("data", function (chunk) {
            data.push(chunk);
        })
        .on("end", function () {
            if (undefined === responseText) {
                var responseBody = {
                    method: request.method,
                    url: request.url
                };
                if (data.length) {
                    responseBody.body = Buffer.concat(data).toString();
                }
                responseText = JSON.stringify(responseBody);
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
