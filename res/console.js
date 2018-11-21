(function () {
    "use strict";

    var _console = window.console;

    function _wrapMethod (methodName) {
        return function (text) {
            _console[methodName].apply(_console, arguments);
            var div = document.createElement("div");
            div.appendChild(document.createTextNode(text.toString()));
            document.body.appendChild(div).className = methodName;
        };
    }

    window.console = {
        log: _wrapMethod("log"),
        warn: _wrapMethod("warn"),
        error: _wrapMethod("error")
    };

}());
