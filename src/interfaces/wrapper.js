/**
 * @file Interface wrapper
 */
/*#ifndef(UMD)*/
(function () {/* Begin of privacy scope */
    "use strict";
    /*global _gpfAssert*/ // Assertion method
    /*global _gpfDefine*/ // Shortcut for gpf.define
/*#endif*/

    var
        gpfI = gpf.interfaces,
        gpfFireEvent = gpf.events.fire,
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
                this._start();
                return this;
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
                this._start();
                return this;
            };
        },

        _buildMembers = function (interfaceDef) {
            var
                result = {
                    "+": {},
                    "~": {
                        interface: interfaceDef
                    }
                },
                publicMembers = result.public,
                attributes = new gpf.attributes.Map(),
                prototype = interfaceDef.prototype,
                member,
                method;
            attributes.fillFromClassDef(gpf.classDef(interfaceDef));
            for (member in prototype) {
                if (prototype.hasOwnProperty(member)) {
                    method = prototype[member];
                    if ("constructor" === member) {
                        continue; // ignore
                    }
                    _gpfAssert("function" === typeof method, "Only methods");
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

        MethodCall = _gpfDefine("MethodCall", {

            "-": {

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

            "+": {

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
                },

                /**
                 * Apply the call
                 *
                 * @param {Object} iHandler
                 * @param {Function} callback
                 */
                apply: function (iHandler, callback) {
                    var
                        args = this._args,
                        method = iHandler[this._name],
                        finalArgs,
                        count,
                        idx;
                    if (this._synchronous) {
                        method.apply(iHandler, args);
                        callback.call();
                    } else {
                        count = this._length;
                        finalArgs = new Array(count);
                        finalArgs[--count] = callback;
                        if (count > args.length) {
                            count = args.length;
                        }
                        for (idx = 0; idx < count; ++idx) {
                            finalArgs[idx] = args[idx];
                        }
                        method.apply(iHandler, finalArgs);
                    }
                }

            }

        }),

        WrapInterface = _gpfDefine("WrapInterface", {

            "-": {

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
                 * @type {Function}
                 * @private
                 */
                _callback: null,

                /**
                 * $catch callback
                 *
                 * @type {gpf.events.Handler}
                 * @private
                 */
                _catch: null,

                /**
                 * $finally callback
                 *
                 * @type {gpf.events.Handler}
                 * @private
                 */
                _finally: null,

                /**
                 * $finally event type
                 *
                 * @type {String}
                 * @private
                 */
                _finalEventType: "done",

                /**
                 * Event handler
                 *
                 * @param {gpf.Event} event
                 * @private
                 */
                _asyncResult: function (event) {
                    var
                        iHandler = this._iHandler,
                        calls;
                    if (event && event.type() === "error") {
                        if (this._catch) {
                            gpfFireEvent.call(iHandler, event, this._catch);
                        }
                        return;
                    }
                    calls = this._calls;
                    if (calls.length) {
                        calls.shift().apply(iHandler, this._callback);
                    } else if (this._finally) {
                        gpfFireEvent.call(iHandler, this._finalEventType, this._finally);
                    }
                },

                /**
                 * @type {Boolean}
                 * @private
                 */
                _needStart: true,

                /**
                 * When at least one method is called, this one makes sure the
                 * execution starts
                 *
                 * @private
                 */
                _start: function () {
                    if (this._needStart) {
                        this._needStart = false;
                        setTimeout(this._asyncResult.bind(this), 0);
                    }
                }

            },

            "+": {

                /**
                 * @param {Object} instance
                 * @constructor
                 */
                constructor: function (instance) {
                    this._iHandler = gpfI.query(instance,
                        this.constructor.interface);
                    this._calls = [];
                    this._callback = this._asyncResult.bind(this);
                },

                /**
                 * Configure the error handler
                 *
                 * @param {gpf.events.Handler} eventHandler
                 * @return {WrapInterface}
                 * @chainable
                 */
                $catch: function (eventHandler) {
                    this._catch = eventHandler;
                    this._start();
                    return this;
                },

                /**
                 * Configure the final handler
                 *
                 * @param {gpf.events.Handler} eventHandler
                 * @param {String}[eventType=done] eventType
                 * @return {WrapInterface}
                 * @chainable
                 */
                $finally: function (eventHandler, eventType) {
                    this._finally = eventHandler;
                    if (eventType) {
                        this._finalEventType = eventType;
                    }
                    this._start();
                    return this;
                }
            }

        });

    /**
     * Get or build the wrapper class for the given interface definition
     *
     * @param {Function} interfaceDef
     * @return {Function}
     */
    gpfI.wrap = function (interfaceDef) {
        var
            classDef = gpf.classDef(interfaceDef),
            result = _wrappers[classDef.uid()],
            base,
            nameOnly;
        if (undefined === result) {
            if (interfaceDef === gpfI.Interface) {
                result = WrapInterface;
            } else {
                base = gpfI.wrap(classDef.Base());
                nameOnly = classDef._name.split(".").pop();
                result = _gpfDefine("Wrap" + nameOnly, base, _buildMembers(interfaceDef));
            }
            _wrappers[classDef.uid()] = result;
        }
        return result;
    };

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/
