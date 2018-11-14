"use strict";

const
    tools = require("../../res/tools.js");

module.exports = function (grunt) {

    [
        "node",
        "phantom",
        "rhino",
        "nashorn",
        "wscript",
        "nodewscript"
    ].forEach(function (runtime) {
        const taskName = `exec:test${tools.capitalize(runtime)}Verbose`;
        grunt.registerTask(runtime, (...args) => {
            let parameter;
            if (args.length) {
                parameter = ":" + args.join(":");
            } else {
                parameter = "";
            }
            grunt.task.run(taskName + parameter);
        });
    });

};
