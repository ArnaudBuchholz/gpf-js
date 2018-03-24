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

function getSourceIndex (sources, name) {
    var result;
    sources.every(function (source, index) {
        if (name === source.name) {
            result = index;
            return false;
        }
        return true;
    })
    return result;
}

module.exports = function (sources, dependencies, request) {
    var requested =  categorize(request),
        // Initial is based on tags
        allowed = sources.map(function (source) {
            var tags =  categorize(source.tags || ""),
                feature;
            if (checkCore(tags)) {
                return true;
            }
            feature = checkFeature(tags, requested);
            if (undefined !== feature) {
                return feature;
            }
            return checkHost(tags, requested) || false;
        }),
        index = sources.length,
        source;
    debugger;
    while (--index > 0) {
        if (!allowed[index]) {
            continue;
        }
        source = sources[index];
        (dependencies[source.name] || []).forEach(function (dependency) {
            allowed[getSourceIndex(sources, dependency)] = true;
        });
    }
    return allowed;
};
