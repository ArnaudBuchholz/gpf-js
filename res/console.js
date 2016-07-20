(function () {
    "use strict";

    var _console = window.console;

    function _wrapMethod (methodName) {
        return function () {
            _console[methodName].apply(_console, arguments);
            var div = document.createElement("div");
            div.appendChild(document.createTextNode(arguments[0].toString()));
            document.body.appendChild(div).className = methodName;
        };
    }

    window.console = {
        log: _wrapMethod("log"),
        warn: _wrapMethod("warn"),
        error: _wrapMethod("error")
    };

}());
