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
            // No cache (https://stackoverflow.com/questions/49547/how-to-control-web-page-caching-across-all-browsers)
            response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            response.setHeader("Pragma", "no-cache");
            response.setHeader("Expires", "0");
            if (responseText) {
                response.setHeader("content-length", Buffer.byteLength(responseText));
                response.write(responseText, function () {
                    response.end();
                });
            } else {
                response.end();
            }
        };

    let data = [];
    request
        .on("data", function (chunk) {
            data.push(chunk);
        })
        .on("end", function () {
            if (undefined === responseText && request.method !== "HEAD") {
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

    if (!request.url.startsWith(BASE_URL)) {
        return next();
    }

    _process(request, response);
};
