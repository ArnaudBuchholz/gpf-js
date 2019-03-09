gpf.require.define({
    Tile: "tile.js",
    dom: "../dom.js",
    config: "../../tmp/config.json",
    packageJson: "../../package.json"

}, function (require) {
    "use strict";

    /*jshint camelcase: false */

    var NOT_FOUND = -1,
        START = 0,
        dom = require.dom,
        root = "https://github.com/ArnaudBuchholz/gpf-js/";

    return gpf.define({
        $class: "Github",
        $extend: require.Tile,

        constructor: function () {
            this.$super("github", "GitHub");
            this._version = require.packageJson.version.split("-")[START];
        },

        getStaticContent: function () {
            return [
                dom.div({className: "status", title: "Connecting..."}),
                dom.ul([
                    dom.li({link: root + "issues?q=is%3Aopen+is%3Aissue+no%3Amilestone+-label%3AEPIC"}, "Backlog"),
                    dom.li({link: root + "milestones"}, "Milestones"),
                    dom.li({link: root + "issues/new"}, "New issue")
                ])
            ];
        },

        _buildMilestoneContent: function (milestone) {
            if (!milestone) {
                return [];
            }
            var
                PERCENTAGE = 100,
                closedIssues = milestone.closed_issues,
                progress = Math.floor(PERCENTAGE * closedIssues / (closedIssues + milestone.open_issues));
            return [
                dom.div({
                    className: "release",
                    link: milestone.html_url
                }, this._version),
                dom.div({
                    className: "progress",
                    link: milestone.html_url
                }, progress + "%")
            ];
        },

        getDynamicContent: function () {
            var me = this;
            return gpf.http.get("/github/")
                .then(function (response) {
                    return JSON.parse(response.responseText);
                })
                .then(function (status) {
                    if (status.error) {
                        return [
                            dom.div({
                                className: "status error",
                                title: status.error
                            })
                        ];
                    }
                    return [
                        dom.div({
                            className: "status connected",
                            link: status.profile.html_url,
                            title: status.profile.name
                        })
                    ].concat(me._buildMilestoneContent(status.milestones.filter(function (candidate) {
                        return candidate.title.indexOf(this._version) !== NOT_FOUND;
                    }, me)[START]));
                });
        }

    });

});
