"use strict";

module.exports = function (grunt) {
    grunt.registerTask("make", "Check and build GPF-JS", function () {
        // Check if connect is already running
        var http = require("http"),
            done = this.async(); //eslint-disable-line no-invalid-this

        function run (connectIsIdle) {
            grunt.task.run([
                "exec:version",
                "check"
            ]);
            if (connectIsIdle) {
                grunt.task.run("connect:server");
            }
            grunt.task.run([
                "concurrent:source",
                "exec:buildDebug",
                "exec:buildRelease",
                "uglify:buildRelease",
                "concurrent:debug",
                "concurrent:release",
                "uglify:buildTests",
                "copy:publishVersionPlato",
                "copy:publishVersion",
                "copy:publishVersionDoc",
                "copy:publishTest"
            ]);
            done();
        }

        http.get("http://localhost:8000/package.json", function (res) {
            run(200 !== res.statusCode);
        }).on("error", function () {
            run(true);
        });
    });
};
