gpf.require.define({
    Tile: "tile.js",
    dom: "../dom.js",
    packageJson: "../../package.json"

}, function (require) {
    "use strict";

    var dom = require.dom;

    return gpf.define({
        $class: "Doc",
        $extend: require.Tile,

        constructor: function () {
            this.$super("doc", "Documentation");
            this._setGruntCommand("jsdoc", "Generate documentation");
        },

        getStaticContent: function () {
            return [
                dom.div({
                    className: "version",
                    link: "tmp/doc/private/index.html"
                }, require.packageJson.version),
                dom.div({
                    className: "version public",
                    link: "tmp/doc/public/index.html"
                }, "public")
            ];
        }

    });

});
