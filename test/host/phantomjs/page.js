"use strict";
/*global phantom*/

var fs = require("fs"),
    webPage = require("webpage"),
    page = webPage.create(),
    settings = JSON.parse(fs.read("tmp/config.json")),
    sUrl = "http://localhost:" + settings.serve.httpPort + "/test/host/phantomjs/page.html";

console.log("Opening " + sUrl);

page.onConsoleMessage = function (msg/*, lineNum, sourceId*/) {
    console.log(msg);
};

page.open(sUrl, function () {
    phantom.exit();
});
