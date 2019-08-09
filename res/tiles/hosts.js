gpf.require.define({
    Tile: "tile.js",
    dom: "../dom.js",
    config: "../../tmp/config.json"

}, function (require) {
    "use strict";

    var HTTP_NOTFOUND = 404,
        dom = require.dom,
        config = require.config;

    return gpf.define({
        $class: "Hosts",
        $extend: require.Tile,

        constructor: function () {
            this.$super("hosts", "Hosts");
            this._setGruntCommand("detectSelenium", "Detect selenium");
        },

        getDynamicContent: function () {
            return gpf.http.get("/fs/test/legacy")
                .then(function (response) {
                    if (response.status === HTTP_NOTFOUND) {
                        return [];
                    }
                    return JSON.parse(response.responseText);
                })
                .then(function (legacyFolderContent) {
                    return [
                        dom.label({"for": "hostsVersion"}, "Version: "),
                        dom.select({id: "hostsVersion"}, [
                            dom.optgroup({label: "Current"}, [
                                dom.option({value: "Verbose"}, "source"),
                                dom.option({value: "Debug"}, "debug"),
                                dom.option({value: "Release"}, "release")
                            ]),
                            dom.optgroup({label: "Legacy"}, legacyFolderContent
                                .filter(function (name) {
                                    return name !== "legacy.json";
                                })
                                .map(function (name) {
                                    var version = (/\d+\.\d+\.\d+/).exec(name).toString();
                                    return dom.option({value: "Legacy:" + version}, version);
                                })
                            )
                        ]),
                        dom.ul({id: "hostsNames"}, Object.keys(config.browsers)
                            .concat(["node", "phantom", "nodewscript"])
                            .concat(["rhino"].filter(function () {
                                return config.host.java;
                            }))
                            .concat(["nashorn"].filter(function () {
                                return config.host.nashorn;
                            }))
                            .concat(["wscript", "iescript"].filter(function () {
                                return config.host.wscript;
                            }))
                            .sort()
                            .map(function (name) {
                                return dom.li({id: "host-" + name, link: "host"}, name);
                            })
                        )
                    ];
                });
        }

    });

});
