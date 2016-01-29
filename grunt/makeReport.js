"use strict";

module.exports = {
    src: "tmp/coverage/reports/**/*.json",
    options: {
        type: "lcov",
        dir: "tmp/coverage/reports",
        print: ""
    }
};
