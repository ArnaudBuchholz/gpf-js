"use strict";
/*jshint rhino:true*/
/*eslint-env rhino*/
/*global run*/ // From bdd.js

print("Rhino showcase");
/*exported gpfSourcesPath*/
gpfSourcesPath = "src/";
load("src/boot.js");

load("test/host/bdd.js");
load("test/host/console.js");

var sources = gpf.sources(),
    len = sources.length,
    idx,
    src;
for (idx = 0; idx < len; ++idx) {
    src = sources[idx];
    if (!src) {
        break;
    }
    load("test/" + src + ".js");
}

run();
gpf.handleTimeout();
