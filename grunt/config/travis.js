"use strict";

module.exports = function (grunt) {
    return function () {
        const done = this.async(); //eslint-disable-line no-invalid-this
        grunt.util.spawn({
            cmd: "node",
            args: ["make/config", "quiet"],
            opts: {
                stdio: "inherit"
            }
        }, error => error
            ? done()
            : grunt.util.spawn({
                grunt: true,
                args: ["check"],
                opts: {
                    stdio: "inherit"
                }
            }, done)
        );
    };
};
