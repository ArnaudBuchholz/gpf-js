gpf.require.define({}, function () {
    "use strict";

    return {

        addEventsListener: function (events) {
            Object.keys(events).forEach(function (eventKey) {
                var eventParts = eventKey.split("@"),
                    eventSelector = eventParts[0],
                    eventName = eventParts[1],
                    eventHandler = events[eventKey];
                if (eventSelector) {
                    [].slice.call(document.querySelectorAll(eventSelector)).forEach(function (oElement) {
                        oElement.addEventListener(eventName, eventHandler);
                    });
                } else {
                    document.addEventListener(eventName, eventHandler);
                }
            });
        }

    };

});
