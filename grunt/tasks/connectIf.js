"use strict";

const STATUS_OK = 200;

module.exports = function (grunt) {
    grunt.registerTask("connectIf", "Run connect if not detected", function () {
        // Check if connect is already running
        var http = require("http"),
            done = this.async(); //eslint-disable-line no-invalid-this

        function run (connectIsMissing) {
            if (connectIsMissing) {
                grunt.task.run("connect:serve");
            }
            done();
        }

        http.get("http://localhost:" + configuration.serve.httpPort + "/package.json", function (res) {
            run(res.statusCode !== STATUS_OK);
        }).on("error", function () {
            run(true);
        });
    });
};
