"use strict";
(function () {

    /*global config*/
    var Func = Function;

    var es6class;
    try {
        new Func("class A {}")();
        es6class = true;
    } catch (e) {
        es6class = false;
    }

    config.features = {
        es6class: es6class
    };

}());
