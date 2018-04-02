"use strict";

module.exports = {
    plato: ["tmp/plato"],
    tmp: ["tmp/*", "!tmp/.eslintrc", "!tmp/.gitignore", "!tmp/.jshintrc", "!tmp/README.md", "!tmp/import_plato.js"],
    publish: ["tmp/publish/*", "tmp/publish/.*"]
};
