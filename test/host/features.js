"use strict";
(function () {
    /*global config*/

    var Func = Function,
        context = new Func("return this;")(),
        features = {
            es6class: "class A {}",
            propertydescriptor: "Object.getOwnPropertyDescriptor({})"
        };

    for (var feature in features) {
        if (features.hasOwnProperty(feature)) {
            var detection = features[feature],
                detected = context["features:" + feature];
            if (detected === undefined) {
                try {
                    new Func(detection)();
                    detected = true;
                } catch (e) {
                    detected = false;
                }
            }
            features[feature] = detected;
        }
    }

    config.features = features;

}());
