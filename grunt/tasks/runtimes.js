"use strict";

module.exports = function (grunt) {
    [
        "node",
        "phantom",
        "rhino",
        "nashorn",
        "wscript",
        "nodewscript"
    ].forEach(function (runtime) {
        var taskName = "exec:test" + runtime.charAt(0).toUpperCase() + runtime.substr(1) + "Verbose";
        grunt.registerTask(runtime, function () {
            var parameter;
            if (0 === arguments.length) {
                parameter = "";
            } else {
                parameter = ":" + [].slice.call(arguments, 0).join(":");
            }
            grunt.task.run(taskName + parameter);
        });
    });
};
