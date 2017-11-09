"use strict";

module.exports = {

    "platoHistory": {
        src: [`${configuration.path.plato}**`],
        dest: "build/plato.history.zip",
        router: filePath => {
            if (-1 === filePath.indexOf(".history.json")) {
                return null;
            }
            // Remove tmp/plato/...
            return filePath.substr(configuration.path.plato.length);
        },
        compression: "DEFLATE"
    }

};
