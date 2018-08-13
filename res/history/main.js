gpf.require.define({
    releases: "../../build/releases.json",
    dom: "../dom.js"

}, function (require) {
    "use strict";

    var dom = require.dom,
        lastRelease = require.releases[require.releases.length - 1];

    var version = dom.div({
        className: "version"
    }, [
        dom.div({
            className: "title",
        }, lastRelease.label)
    ]);

    version.appendTo(document.body);

});
