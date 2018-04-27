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
            if (0 === args.length) {
                parameter = "";
            } else {
                parameter = ":" + args.join(":");
            }
            grunt.task.run(taskName + parameter);
        });
    });

};
