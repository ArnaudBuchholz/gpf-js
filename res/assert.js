(function () {
    "use strict";

    function _message (status, text) {
        var div = document.createElement("div"),
            span = div.appendChild(document.createElement("span")),
            color;
        div.appendChild(document.createTextNode(text));
        if (status) {
            span.innerHTML = "&check;";
            color = "green";
        } else {
            span.innerHTML = "&cross;";
            color = "red";
        }
        span.setAttribute("style", "width: 1rem; color: " + color + ";");
        return document.body.appendChild(div);
    }

    window.assert = function (condOrFunc, optionalMessage) {
        var BODY = 1,
            condition,
            message;
        if (typeof condOrFunc === "function") {
            message = condOrFunc.toString().match(/(?:=>|{)([^}]*)\}?/)[BODY].toString().trim();
            try {
                condition = condOrFunc();
            } catch (e) {
                condition = false;
            }
        } else {
            condition = condOrFunc;
            message = optionalMessage;
        }
        return _message(condition, message);
    };

    window.onerror = function (error) {
        _message(false, error.toString());
    };

}());
