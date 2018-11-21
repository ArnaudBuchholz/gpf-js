gpf.require.define({}, function () {
    "use strict";

    function _addEventsListener (selector, eventName, handler) {
        [].slice.call(document.querySelectorAll(selector)).forEach(function (oElement) {
            oElement.addEventListener(eventName, handler);
        });
    }

    var api = {

        addEventsListener: function (events) {
            Object.keys(events).forEach(function (eventKey) {
                var eventParts = eventKey.split("@"),
                    selector = eventParts.shift(),
                    eventName = eventParts.shift(),
                    handler = events[eventKey];
                if (selector) {
                    _addEventsListener(selector, eventName, handler);
                } else {
                    document.addEventListener(eventName, handler);
                }
            });
        },

        clear: function (element) {
            element.innerHTML = "";
        }

    };

    [
        "div",
        "span",
        "li",
        "ul",
        "label",
        "select",
        "optgroup",
        "option"

    ].forEach(function (tagName) {
        api[tagName] = gpf.web.createTagFunction(tagName);
    });

    return api;

});
