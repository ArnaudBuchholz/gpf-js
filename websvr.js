/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    /**
     * Run the GPF web server
     *
     * @param {String[]|Object|undefined} options
     */
    gpf.runWebServer = function (options) {
        // Options parsing
        if (options instanceof Array) {
            options = gpf.Parameter.parse([{
                name: "port",
                type: "number",
                defaultValue: 80,
                prefix: "port"
            }, {
                name: "root",
                type: "string",
                defaultValue: ".",
                prefix: "root"
            }, gpf.Parameter.VERBOSE, gpf.Parameter.HELP], options);
        }
        // Server boot trace
        console.log("GPF " + gpf.version() + " web server");
        if (options.root === ".") {
            options.root = process.cwd();
        }
        if (options.verbose) {
            console.log("root: " + options.root);
            console.log("port: " + options.port);
        }
        // Expose ExtJS require
        global.require = require;
        // Build the web server
        require("http").createServer(function (request, response) {
            if (options.verbose) {
                console.log([
                    request.method,
                    "     ".substr(request.method.length),
                    request.url
                ].join(""));
            }
            /**
             * Pre-formatted plain answer
             *
             * @param {Number} statusCode
             * @param {String} text
             */
            response.plain = function (statusCode, text) {
                this.writeHead(statusCode, {"Content-Type": "text/plain"});
                response.write([
                    "port    : " + options.port,
                    "method  : " + request.method,
                    "url     : " + request.url,
                    "root    : " + options.root,
                    "headers : "
                        + JSON.stringify(request.headers, null, "\t\t"),
                    text
                ].join("\n"));
                response.end();
            };
            response.plain(200, ".");
        }).on("close", function () {
            console.log("Closed.");
        }).listen(options.port);
        if (options.verbose) {
            console.log("Listening...");
        }
    };

    /**
     * Detect if the library was run as a standalone file, in that case, run
     * the web server.
     */
    (function () {
        var
            path,
            scriptName;
        if ("nodejs" !== gpf.host()) {
            return; // Not inside nodejs
        }
        path = require("path");
        scriptName = path.basename(process.argv[1], ".js");
        if (scriptName === "boot"
            || scriptName === "gpf"
            || scriptName === "gpf-debug") {
            gpf.runWebServer(process.argv.slice(2));
        } else {
            console.log(scriptName);
        }
    }());

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/
