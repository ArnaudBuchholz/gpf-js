"use strict";

const WScript = require("./WScript");

class ActiveXObject {

    constructor (className) {
        return WScript.CreateObject(className);
    }

}

module.exports = ActiveXObject;
