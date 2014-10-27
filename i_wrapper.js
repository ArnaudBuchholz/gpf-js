/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    var
        _wrappers = {},

        /**
         * Build the synchronous member (no event)
         *
         * @param {String} name
         * @return {Function}
         * @closure
         * @private
         */
        _sync = function (name) {
            return function () {
                this._calls.push(new MethodCall(true, name, arguments, 0));
                return this.then(this._callback);
            };
        },

        /**
         * Build the asynchronous member (i.e. event related)
         *
         * @param {String} name
         * @param {Number} length argument count in the function (used to deduce
         * where the event handler is)
         * @return {Function}
         * @closure
         * @private
         */
        _async = function (name, length) {
            return function () {
                this._calls.push(new MethodCall(false, name, arguments,
                    length));
                return this.then(this._callback);
            };
        },

        _buildMembers = function (interfaceDef) {
            var
                result = {
                    public: {},
                    static: {
                        interface: interfaceDef
                    }
                },
                publicMembers = result.public,
                attributes = new gpf.attributes.Map(interfaceDef),
                prototype = interfaceDef.prototype,
                member,
                method;
            for (member in prototype) {
                if (prototype.hasOwnProperty(member)) {
                    method = prototype[member];
                    gpf.ASSERT("function" === typeof method, "Only methods");
                    if (attributes.member(member)
                        .has(gpf.attributes.ClassEventHandlerAttribute)) {
                        publicMembers[member] = _async(member, method.length);
                    } else {
                        publicMembers[member] = _sync(member);
                    }
                }
            }
            return result;
        },

        MethodCall = gpf.declare("MethodCall", {

            private: {

                /**
                 * Call is synchronous
                 *
                 * @type {Boolean}
                 * @private
                 */
                _synchronous: true,

                /**
                 * Method name
                 *
                 * @type {String}
                 * @private
                 */
                _name: "",

                /**
                 * Method arguments
                 *
                 * @type {Array}
                 * @private
                 */
                _args: [],

                /**
                 * When asynchronous, length provides the position of the event
                 * handler
                 *
                 * @type {Number}
                 * @private
                 */
                _length: 0

            },

            public: {

                /**
                 *
                 * @param {Boolean} synchronous Call is synchronous
                 * @param {String} name Method name
                 * @param {Array} args Method arguments
                 * @param {Number} length When asynchronous, length provides the
                 * position of the event handler
                 */
                constructor: function (synchronous, name, args, length) {
                    this._synchronous = synchronous;
                    this._name = name;
                    this._args = args;
                    this._length = length;
                }

            }

        }),

        WrapInterface = gpf.declare("WrapInterface", "gpf.Promise", {

            private: {

                /**
                 * Interface handler
                 *
                 * @type {gpf.interfaces.Interface}
                 * @private
                 */
                _iHandler: null,

                /**
                 * List of method calls
                 *
                 * @type {MethodCall[]}
                 * @private
                 */
                _calls: [],

                /**
                 * Callback to be used as event handler
                 *
                 * @type {gpf.Callback}
                 * @private
                 */
                _callback: null,

                /**
                 * Event handler
                 *
                 * @param {gpf.Event} event
                 * @private
                 */
                _asyncResult: function (event) {
                    if (event.type() === "error") {
                        this.reject({
                            error: event
                        });
                    } else {

                    }
                },

                /**
                 * Call a synchronous method
                 *
                 * @param {String} name
                 * @param {Array} incomingArguments
                 * @return {WrapInterface}
                 * @private
                 */
                _sync: function (name, incomingArguments) {
                    var
                        iHandler = this._iHandler;
                    iHandler[name].apply(iHandler, incomingArguments);
                    return this;
                },

                /**
                 * Call an asynchronous method
                 *
                 * @param {String} name
                 * @param {Number} length
                 * @param {Array} incomingArguments
                 * @return {WrapInterface}
                 * @private
                 */
                _async: function (name, length, incomingArguments) {
                    var
                        iHandler = this._iHandler,
                        finalArguments = new Array(length),
                        count = length - 1,
                        idx;
                    if (count > incomingArguments.length) {
                        count = incomingArguments.length - 1;
                    }
                    for (idx = 0; idx < count; ++idx) {
                        finalArguments[idx] = incomingArguments[idx];
                    }
                    finalArguments[length - 1] = this._callback;
                    iHandler[name].apply(iHandler, finalArguments);
                    return this;
                }

            },

            public: {

                /**
                 * @param {Object} instance
                 * @constructor
                 */
                constructor: function (instance) {
                    this._iHandler = gpf.interfaces.query(instance,
                        this.constructor.interface);
                    this._calls = [];
                    this._callback = new gpf.Callback(this._callback, this);
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
