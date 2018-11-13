"use strict";

const
    BASE_URL = "/cache/",
    cache = {},
    handlers = {

        GET: (key, request, response) => {
            let cacheValue = cache[key];
            if (undefined === cacheValue) {
                response.statusCode = 204;
                response.end();

            } else {
                response.statusCode = 200;
                response.end(cacheValue);

            }

        },

        POST: (key, request, response) => {
            let data = [];
            request
                .on("data", function (chunk) {
                    data.push(chunk);
                })
                .on("end", function () {
                    cache[key] = Buffer.concat(data).toString();
                    response.statusCode = 200;
                    response.end();
                });
        },

        DELETE: (key, request, response) => {
            delete cache[key];
            response.statusCode = 200;
            response.end();
        }

    };

module.exports = (request, response, next) => {

    if (!request.url.startsWith(BASE_URL)) {
        return next();
    }

    let handler = handlers[request.method];

    if (undefined === handler) {
        response.statusCode = 500;
        response.end("Invalid method");
    } else {
        handler(request.url.substr(BASE_URL.length), request, response);
    }

};
