gpf.require.define({
    Tile: "tile.js",
    dom: "../dom.js",
    config: "../../tmp/config.json"

}, function (require) {
    "use strict";

    var dom = require.dom,
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
                    if (404 === response.status) {
                        return [];
                    }
                    return JSON.parse(response.responseText);
                })
                .then(function (legacyFolderContent) {
                    var
                        content = [
                            dom.label({for: "hostsVersion"}, "Version: "),
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
                                        var version = name.substr(0, name.lastIndexOf("."));
                                        return dom.option({value: "Legacy:" + version}, version);
                                    })
                                )
                            ]),
                            dom.ul({id: "hostsNames"}, Object.keys(config.browsers)
                                .concat(["node", "phantom"])
                                .map(function (name) {
                                    return dom.li({id:"host-" + name, link:"env"}, name);
                                })
                            )
                        ];
                    return content;
                });
        }

    });

});
