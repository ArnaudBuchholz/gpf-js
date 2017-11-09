"use strict";

module.exports = grunt => {

    grunt.registerTask("plato", [
        "clean:plato",
        "unzip:platoHistory",
        "exec:plato"
    ]);

};
