"use strict";

const
    classNames = {},
    argumentsArray = process.argv.slice(2),
    argumentsFunction = index => argumentsArray[index],
    coreFunction = Function;

Object.defineProperty(argumentsFunction, "length", {
    value: argumentsArray.length,
    writable: false
});

// These are not defined in this host
global.JSON = undefined;
global.Promise = undefined;
global.clearTimeout = undefined;
global.setTimeout = undefined;
coreFunction.prototype.bind = undefined;

// Not proud of this one but I had to find a way...
global.Function = function (content) {
    if (content === "return function functionName () {};") {
        return coreFunction("return function notFunctionName () {};");
    }
    return coreFunction.apply(this, arguments);
};
global.Function.prototype = coreFunction.prototype;

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
    Quit: code => process.exit(code),
    Sleep: ms => {
        const init = new Date();
        let now = init;
        while (now - init < ms) {
            now = new Date();
        }
    }

};
