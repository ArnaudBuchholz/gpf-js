"use strict";

const fs = require("fs");

class File {

    constructor (fileName) {
        this._fileName = fileName;
    }

    ReadAll () {
        return fs.readFileSync(this._fileName).toString();
    }

    Close () {
    }

}

class ScriptingFileSystemOjbect {

    OpenTextFile (filename/*, iomode, create, format*/) {
        return new File(filename);
    }

}

module.exports = ScriptingFileSystemOjbect;
