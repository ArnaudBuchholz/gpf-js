"use strict";

module.exports = {

    "platoHistory": {
        src: [`${configuration.path.plato}**`],
        dest: "build/plato.history.zip",
        router: filePath => {
            if (filePath.indexOf(".history.json") === -1) {
                return null;
            }
            // Remove tmp/plato/...
            return filePath.substr(configuration.path.plato.length);
        },
        compression: "DEFLATE"
    }

};
