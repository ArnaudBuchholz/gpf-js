"use strict";

module.exports = function (grunt) {
    grunt.registerTask("connectIf", "Run connect if not detected", function () {
        // Check if connect is already running
        var http = require("http"),
            done = this.async(); //eslint-disable-line no-invalid-this

        function run (connectIsMissing) {
            if (connectIsMissing) {
                grunt.task.run("connect:server");
            }
            done();
        }

        http.get("http://localhost:" + configuration.httpPort + "/package.json", function (res) {
            run(200 !== res.statusCode);
        }).on("error", function () {
            run(true);
        });
    });
};
