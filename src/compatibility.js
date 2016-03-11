/*#ifndef(UMD)*/
"use strict";
/*global _gpfCompatibility*/ // Polyfills for missing 'standard' methods
/*#endif*/

(function () {
    var type,
        overrides;

    function install (dictionary, methods) {
        for (var name in methods) {
            /* istanbul ignore else */
            if (methods.hasOwnProperty(name)) {
                /* istanbul ignore if */ // NodeJS environment already contains all methods
                if (undefined === dictionary[name]) {
                    dictionary[name] = methods[name];
                }
            }
        }
    }

    for (type in _gpfCompatibility) {
        /* istanbul ignore else */
        if (_gpfCompatibility.hasOwnProperty(type)) {
            overrides = _gpfCompatibility[type];
            var on = overrides.on;
            if (overrides.methods) {
                install(on.prototype, overrides.methods);
            }
            if (overrides.statics) {
                install(on, overrides.statics);
            }
        }
    }

}());

/*#ifndef(UMD)*/

gpf.internals._gpfCompatibility = _gpfCompatibility;

/*#endif*/
