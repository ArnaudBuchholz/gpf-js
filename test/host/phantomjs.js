"use strict";
/*jshint phantom: true*/
/*eslint-env phantomjs*/

var fs = require("fs");
require("./loader.js"); /*global loadGpfAndTests*/

loadGpfAndTests({
    parameters: require("system").args.slice(1),
    // https://groups.google.com/forum/#!msg/phantomjs/OswbWiKrLYI/ndoXvK13OrIJ
    gpfPath: phantom.libraryPath.split("/").slice(0, -2).join(fs.separator),
    pathSeparator: fs.separator,
    log: console.log.bind(console),
    exit: phantom.exit,
    require: require,
    read: function (filePath) {
        return fs.read(filePath);
    }
});
