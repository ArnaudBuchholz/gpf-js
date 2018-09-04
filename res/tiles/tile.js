gpf.require.define({
    don: "../dom.js"

}, function (require) {
    "use strict";

    var dom = require.don;

    return gpf.define({
        $class: "Tile",

        constructor: function (id, title) {
            this._id = id;
            this._title = title;
        },

        getId: function () {
            return this._id;
        },

        _setGruntCommand: function (command, title) {
            this._command = command;
            this._commandTitle = title;
        },

        render: function () {
            var staticChildren = [dom.div({className: "title"}, this._title)];
            if (this._command) {
                staticChildren.push(dom.div({
                    className: "exec",
                    link: "grunt/" + this._command,
                    title: this._commandTitle
                }));
            }
            return dom.li({id: this._id},
                dom.div({className: "static"}, staticChildren.concat(this.getStaticContent())),
                dom.div({className: "dynamic"}));
        },

        getStaticContent: function () {
            return [];
        },

        getDynamicContent: function () {
            return Promise.resolve([]);
        },

        drawCharts: function () {
            return false;
        }

    });

});
