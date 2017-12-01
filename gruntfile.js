"use strict";
/*jshint node: true*/
/*eslint-env node*/

// https://github.com/nodejs/node/blob/master/doc/changelogs/CHANGELOG_V8.md#2017-10-24-version-880-current-mylesborins
process.env.NODE_NO_HTTP2 = 1; //eslint-disable-line no-process-env

module.exports = function (grunt) {

    require("time-grunt")(grunt);

    // Since the tasks are split using load-grunt-config, a global object contains the configuration
    /*global configFile, configuration*/
    var ConfigFile = require("./make/configFile.js");
    global.configFile = new ConfigFile();
    global.configuration = Object.create(configFile.content);
    if (configFile.isNew()) {
        grunt.registerTask("default", function () {
            var done = this.async(); //eslint-disable-line no-invalid-this
            grunt.util.spawn({
                cmd: "node",
                args: ["make/config"],
                opts: {
                    stdio: "inherit"
                }
            }, function (error) {
                if (error) {
                    done();
                    return;
                }
                grunt.util.spawn({
                    grunt: true,
                    args: ["check", "jsdoc", "default"],
                    opts: {
                        stdio: "inherit"
                    }
                }, done);
            });
        });
        return;
    }

    configFile.readSourceFiles();

    // Amend the configuration with internal settings
    configuration.pkg = grunt.file.readJSON("./package.json");

    // As well as known path
    configuration.path = {
        plato: "tmp/plato/"
    };

    require("load-grunt-config")(grunt);
    grunt.task.loadTasks("grunt/tasks");

};
