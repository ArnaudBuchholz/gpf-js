gpf.require.define({}, function () {
    "use strict";

    function _addEventsListener (selector, eventName, handler) {
        [].slice.call(document.querySelectorAll(selector)).forEach(function (oElement) {
            oElement.addEventListener(eventName, handler);
        });
    }

    return {

        addEventsListener: function (events) {
            Object.keys(events).forEach(function (eventKey) {
                var eventParts = eventKey.split("@"),
                    selector = eventParts[0],
                    eventName = eventParts[1],
                    handler = events[eventKey];
                if (selector) {
                    _addEventsListener(selector, eventName, handler);
                } else {
                    document.addEventListener(eventName, handler);
                }
            });
        }

    };

});
