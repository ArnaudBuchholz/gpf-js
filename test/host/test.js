(function (context) {
    "use strict";

    var
        _tests = {},
        _currentTest = _tests;

    context.describe = function (name, callback) {
        var lastTest = _currentTest;
        _currentTest = lastTest[name] = {};
        callback();
        _currentTest = lastTest;
    };

    context.it = function (label, callback) {
    };

    context.assert = {

    };

}(this));
