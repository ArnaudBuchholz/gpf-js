/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    var
        _wrappers = {},

        _sync = function (name) {
            return function () {
                return this._sync(name, arguments);
            };
        },

        _async = function (name) {
            return function () {
                return this._async(name, arguments);
            };
        },


        _buildMembers = function (interfaceDef) {
            var result = {},
                attributes = new gpf.attributes.Map(interfaceDef),
                prototype = interfaceDef.prototype,
                member;
            for (member in prototype) {
                if (prototype.hasOwnProperty(member)) {
                    if (attributes.member(member)
                        .has(gpf.attributes.ClassEventHandlerAttribute)) {
                        result[member] = _async(member);
                    } else {
                        result[member] = _sync(member);
                    }
                }
            }
            return result;
        };

    gpf.declare("WrapInterface", {

        private: {

            /**
             * Interface instance
             *
             * @type {gpf.interfaces.Interface}
             * @private
             */
            _instance: null,

            _sync: function (name, args) {
                var instance = this._instance;
                instance[name].apply(instance, args);
                return this;
            },

            _async: function (name, args) {

            }

        },

        public: {

            /**
             * Wrap an interface
             *
             * @param {gpf.interfaces.Interface} instance
             * @constructor
             */
            constructor: function (instance) {
                this._instance = instance;
            }

        }

    });

    /**
     * Get or build the wrapper class for the given interface definition
     *
     * @param {Function} interfaceDef
     * @eturn {Function}
     */
    gpf.interfaces.wrap = function (interfaceDef) {
        var
            classDef = gpf.classDef(interfaceDef),
            result = _wrappers[classDef.uid()],
            base;
        if (undefined === result) {
            if (interfaceDef === gpf.interfaces.Interface) {
                result = WrapInterface;
            } else {
                base = gpf.interfaces.wrap(classDef.Base());
                result = gpf.define("Wrap" + classDef.name(), base,
                    _buildMembers(interfaceDef));
            }
            _wrappers[classDef.uid()] = result;
        }
        return result;
    };

})(); /* End of privacy scope */
