"use strict";

module.exports = function (sources/*, dependencies, modifiers*/) {
    var initial = sources.filter(function (source) {
        var tags = (source.tags || "").split(" ");
        if (tags.indexOf("core") !== -1) {
            return true;
        }
    });

    return initial;
};
