"use strict";

var COMPATIBILITY = "compatibility",
    HOST_PREFIX = "host:",
    EXCLUDE_PREFIX = "-",
    INCLUDE_PREFIX = "+",
    NOT_FOUND = -1;

function categorize (tags) {
    return tags.split(" ").reduce(function (categorized, tag) {
        if (tag) {
            if (tag.startsWith(HOST_PREFIX)) {
                categorized.hosts.push(tag.substring(HOST_PREFIX.length));
            } else if (tag.startsWith(EXCLUDE_PREFIX)) {
                categorized.excluded.push(tag.substring(EXCLUDE_PREFIX.length));
            } else if (tag.startsWith(INCLUDE_PREFIX)) {
                categorized.included.push(tag.substring(INCLUDE_PREFIX.length));
            } else {
                categorized.features.push(tag);
            }
        }
        return categorized;
    }, {
        hosts: [],
        features: [],
        excluded: [],
        included: []
    });
}

function postProcessRequest (sources, request) {
    if (!request.features.length) {
        // if no features is specified, include all *but* excluded & compatibility
        sources.forEach(function (source) {
            categorize(source.tags || "").features
                .filter(function (feature) {
                    return feature !== COMPATIBILITY
                        && request.features.indexOf(feature) === NOT_FOUND;
                })
                .forEach(function (feature) {
                    request.features.push(feature);
                });
        });
    }
    return request;
}

function intersect (array1, array2) {
    return array1.some(function (value1) {
        return array2.indexOf(value1) !== NOT_FOUND;
    });
}

function includeCore (tags) {
    return tags.features.indexOf("core") !== NOT_FOUND;
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

function shouldIncludeSource (requested, source) {
    var tags = categorize(source.tags || ""),
        shouldIncludeFeature,
        shouldIncludeHost;
    // core tags are always included
    if (includeCore(tags)) {
        return true;
    }
    shouldIncludeFeature = includeFeature(tags, requested);
    // Featured sources that are not explicitely requested are discarded
    if (shouldIncludeFeature === false) {
        return shouldIncludeFeature;
    }
    // Process host relevant sources
    shouldIncludeHost = includeHost(tags, requested);
    if (undefined !== shouldIncludeHost) {
        return shouldIncludeHost;
    }
    return shouldIncludeFeature;
}

function includeRequestedSources (sources, requested) {
    return sources.map(function (source) {
        if (requested.excluded.indexOf(source.name) !== NOT_FOUND) {
            return false;
        }
        if (requested.included.indexOf(source.name) !== NOT_FOUND) {
            return true;
        }
        return shouldIncludeSource(requested, source);
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

function getFlavor (sources, dependencies, request) {
    var requested = postProcessRequest(sources, categorize(request)),
        // Initial is based on tags
        allowed = includeRequestedSources(sources, requested),
        index = sources.length,
        features = [].concat(requested.features),
        featureSetChanged = false;
    function allow (dependency) {
        if (requested.excluded.indexOf(dependency) !== NOT_FOUND) {
            return;
        }
        var sourceIndex = getSourceIndex(sources, dependency),
            tags = categorize(sources[sourceIndex].tags || "");
        // Process dependant features
        tags.features
            .filter(function (feature) {
                return features.indexOf(feature) === NOT_FOUND;
            })
            .filter(function (feature) {
                return feature !== COMPATIBILITY; // *Must* be requested explicitely
            })
            .forEach(function (feature) {
                features.push(feature);
                featureSetChanged = true;
            });
        allowed[sourceIndex] = true;
    }
    while (--index) {
        if (!allowed[index]) {
            continue;
        }
        // var before = features.length;
        (dependencies[sources[index].name] || []).forEach(allow);
        // if (features.length !== before) {
        //     console.log(sources[index].name + ": " + features.slice(before));
        // }
    }
    if (featureSetChanged) {
        return getFlavor(sources, dependencies, features.join(" ") + " " + request);
    }
    return allowed;
}

module.exports = getFlavor;
