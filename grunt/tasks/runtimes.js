"use strict";

module.exports = function (grunt) {
    [
        "node",
        "phantom",
        "rhino",
        "wscript"
    ].forEach(function (runtime) {
        var taskName = "exec:test" + runtime.charAt(0).toUpperCase() + runtime.substr(1) + "Verbose";
        grunt.registerTask(runtime, function (source) {
            var parameter;
            if (undefined === source) {
                parameter = "";
            } else {
                parameter = ":" + source;
            }
            grunt.task.run(taskName + parameter);
        });
    });
};
