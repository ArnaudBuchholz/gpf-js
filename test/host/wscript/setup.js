"use strict";

global.WScript = require("./WScript");
global.ActiveXObject = require("./ActiveXOBject");

const _console = console;
Object.defineProperty(global, "console", {
    get: () => _console,
    set: value => 0 // ignore
});
