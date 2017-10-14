"use strict";
/*global document*/

if (document.currentScript) {
    module.exports = "web page";
} else {
    module.exports = "command line";
}

