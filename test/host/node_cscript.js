"use strict";

// trick UMD loader to load debug & release versions through a fake AMD define
function define (any, factory) {
    global.gpf = {};
    factory(global.gpf);
}
define.amd = true;
global.define = define;

// Not supposed to be supported
global["features:es6class"] = false;
global["features:propertydescriptor"] = false;

require("./wscript/setup.js");
require("./cscript.js");
