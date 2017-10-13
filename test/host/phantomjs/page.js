"use strict";

var fs = require("fs"),
    webPage = require("webpage"),
    page = webPage.create(),
    settings = JSON.parse(fs.read("tmp/config.json")),
    sUrl = "http://localhost:" + settings.serve.httpPort + "/test/host/phantomjs/page.html";

console.log("Opening " + sUrl);
page.open(sUrl, function (status) {
    console.log("Status: " + status);
    console.log(page.module.exports);

});
