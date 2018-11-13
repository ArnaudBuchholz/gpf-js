"use strict";
/*jshint node: true*/
/*eslint-env node*/
/*eslint-disable no-sync*/

// https://github.com/nodejs/node/blob/master/doc/changelogs/CHANGELOG_V8.md#2017-10-24-version-880-current-mylesborins
process.env.NODE_NO_HTTP2 = 1; //eslint-disable-line no-process-env

module.exports = function (grunt) {

    require("time-grunt")(grunt);

    // Since the tasks are split using load-grunt-config, a global object contains the configuration
    /*global configFile, configuration*/
    var ConfigFile = require("./make/configFile.js");
    global.configFile = new ConfigFile(true);
    global.configuration = Object.create(configFile.content);
    if (configFile.isNew()) {
        require("fs").readdirSync("./grunt/config").forEach(function (fileName) {
            var from = 0,
                to = fileName.lastIndexOf(".");
            grunt.registerTask(fileName.substring(from, to), require("./grunt/config/" + fileName)(grunt));
        });
        return;
    }

    // Amend the configuration with internal settings
    configuration.pkg = grunt.file.readJSON("./package.json");

    // As well as known path
    configuration.path = {
        plato: "tmp/plato/"
    };

    require("load-grunt-config")(grunt);
    grunt.task.loadTasks("grunt/tasks");

};
