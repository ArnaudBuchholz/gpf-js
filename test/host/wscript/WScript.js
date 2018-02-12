"use strict";

const
    classNames = {},
    argumentsArray = process.argv.slice(2),
    argumentsFunction = index => argumentsArray[index];

Object.defineProperty(argumentsFunction, "length", {
    value: argumentsArray.length,
    writable: false
});

module.exports = {

    CreateObject: className => {
        if (undefined === classNames[className]) {
            classNames[className] = require("./" + className + ".js");
        }
        return new classNames[className]();
    },

    Arguments: argumentsFunction,
    ScriptFullName: process.argv[1].replace(/\//g, "\\"),
    Echo: text => console.log(text),
    Quit: code => process.exit(code)

};
