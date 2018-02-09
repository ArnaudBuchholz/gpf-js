"use strict";

const classNames = {};

module.exports = {

    CreateObject: className => {
        if (undefined === classNames[className]) {
            classNames[className] = require("./" + className + ".js");
        }
        return new classNames[className]();
    },

    Arguments: process.argv.slice(2),
    ScriptFullName: process.argv[1],
    Echo: text => console.log(text),
    Quit: code => process.exit(code)

};
