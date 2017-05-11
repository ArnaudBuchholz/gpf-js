"use strict";

const
    BASE_URL = "/echo/",
    url = require("url");

module.exports = (request, response, next) => {

    if (0 !== request.url.indexOf(BASE_URL)) {
        return next();
    }

    let parsedUrl = url.parse(request.url, true),
        statusCode;

    if (parsedUrl.query.status) {
        statusCode = parseInt(parsedUrl.query.status, 10);
    } else {
        statusCode = 200;
    }

    response.statusCode = statusCode;
    response.end(JSON.stringify({
        method: request.method,
        url: request.url,
        content: parsedUrl.query.content
    }));
};
