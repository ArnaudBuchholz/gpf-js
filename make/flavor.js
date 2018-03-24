"use strict";

function categorize (tags) {
    var array = tags.split(" ");
    return {
        hosts: array.filter(function (tag) {
            return 0 === tag.indexOf("host:");
        }).map(function (hostTag) {
            return hostTag.substr(5);
        }),
        features: array.filter(function (tag) {
            return tag && -1 === tag.indexOf(":");
        })
    };
}

function intersect (array1, array2) {
    return array1.some(function (value1) {
        return array2.indexOf(value1) !== -1;
    });
}

function checkCore (tags) {
    return -1 !== tags.features.indexOf("core");
}

function checkFeature (tags, requested) {
    if (tags.features.length && requested.features.length) {
        return intersect(tags.features, requested.features);
    }
}

function checkHost (tags, requested) {
    if (tags.hosts.length && requested.hosts.length) {
        return intersect(tags.hosts, requested.hosts);
    }
}

module.exports = function (sources, dependencies, request) {
    var requested =  categorize(request),
        // Initial is based on tags
        allowed = sources.map(function (source) {
            var tags =  categorize(source.tags || "");
            return checkCore(tags) // core sources are always kept
                || checkFeature(tags, requested)
                || checkHost(tags, requested)
                || false;
        });

    return allowed;
};
