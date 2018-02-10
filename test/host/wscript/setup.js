"use strict";

global.WScript = require("./WScript");
global.ActiveXObject = require("./ActiveXOBject");
global.Enumerator = require("./Enumerator");

const _console = console;
Object.defineProperty(global, "console", {
    get: () => _console,
    set: () => 0 // ignore
});
