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

function includeCore (tags) {
    return -1 !== tags.features.indexOf("core");
}

function includeFeature (tags, requested) {
    if (tags.features.length && requested.features.length) {
        return intersect(tags.features, requested.features);
    }
}

function includeHost (tags, requested) {
    if (tags.hosts.length && requested.hosts.length) {
        return intersect(tags.hosts, requested.hosts);
    }
}

function includeRequestedSources (sources, requested) {
    return sources.map(function (source) {
        var tags =  categorize(source.tags || ""),
            shouldIncludeFeature;
        if (includeCore(tags)) {
            return true;
        }
        shouldIncludeFeature = includeFeature(tags, requested);
        if (undefined !== shouldIncludeFeature) {
            return shouldIncludeFeature;
        }
        return includeHost(tags, requested);
    });
}

function getSourceIndex (sources, name) {
    var result;
    sources.every(function (source, index) {
        if (name === source.name) {
            result = index;
            return false;
        }
        return true;
    });
    return result;
}

/*
function merge () {
    var result = [];
    [].slice.call(arguments, 0).forEach(function (allowed) {
        allowed.forEach(function (value, index) {
            result[index] = result[index] || value;
        });
    });
    return result;
}
*/

function getFlavor (sources, dependencies, request) {
    var requested =  categorize(request),
        // Initial is based on tags
        allowed = includeRequestedSources(sources, requested),
        index = sources.length;
    function allow (dependency) {
        allowed[getSourceIndex(sources, dependency)] = true;
    }
    while (--index > 0) {
        if (!allowed[index]) {
            continue;
        }
        (dependencies[sources[index].name] || []).forEach(allow);
    }
    return allowed;
}

module.exports = getFlavor;
