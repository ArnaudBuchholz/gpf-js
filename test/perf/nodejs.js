"use strict";

global.gpfSourcesPath = require("path").join(__dirname, "../../src/");
require("../../src/boot");

require("./engine")(require("./" + process.argv[2] + ".js"));
