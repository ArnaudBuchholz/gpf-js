"use strict";

module.exports = {

    "platoHistory": {
        src: [`${configuration.path.plato}**`],
        dest: "build/plato.history.zip",
        router: filePath => {
            if (!filePath.includes(".history.json")) {
                return null;
            }
            // Remove tmp/plato/...
            return filePath.substring(configuration.path.plato.length);
        },
        compression: "DEFLATE"
    }

};
