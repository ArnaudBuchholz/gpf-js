/*#ifndef(UMD)*/
(function () {/* Begin of privacy scope */
    "use strict";
    /*global _gpfDefine*/ // Shortcut for gpf.define
    /*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*#endif*/

    _gpfErrorDeclare("engine", {
        "engineStackUnderflow":
            "Stack underflow",
        "engineTypeCheck":
            "Type check"
    });

    var
        TYPE_NUMBER         = "N", // number
        TYPE_STRING         = "S", // string
        TYPE_ID             = "I", // IdString(exec:false)
        TYPE_EXECUTABLEID   = "E", // IdString(exec:true)
        TYPE_ARRAY          = "A", // array
        TYPE_DICTIONARY     = "D", // object
        TYPE_CODE           = "C", // CodeArray

        toType = function (value) {
            var type = typeof value;
            if ("number" === type) {
                return TYPE_NUMBER;
            } else if ("string" === type) {
                return TYPE_STRING;
            } else if (value instanceof IdString) {
                if (value.executable()) {
                    return TYPE_EXECUTABLEID;
                } else {
                    return TYPE_ID;
                }
            } else if (value instanceof CodeArray) {
                return TYPE_CODE;
            } else if (value instanceof Array) {
                return TYPE_ARRAY;
            } else {
                return TYPE_DICTIONARY;
            }
        },

        SYS_DICT = {

            add: function (engineState) {
                var args = engineState.checkAndPop("NN");
                engineState.push(args[0] + args[1]);
            },

            mul: function (engineState) {
                var args = engineState.checkAndPop("NN");
                engineState.push(args[0] * args[1]);
            },

            sub: function (engineState) {
                var args = engineState.checkAndPop("NN");
                engineState.push(args[0] - args[1]);
            },

            div: function (engineState) {
                var args = engineState.checkAndPop("NN");
                engineState.push(args[0] / args[1]);
            }

        },

        CodeArray = _gpfDefine("CodeArray", Object, {

            constructor: function () {
                this._items = [];
            }

        }),

        IdString = _gpfDefine("IdString", Object, {

            constructor: function (label, executable) {
                this._label = label;
                this._executable = executable;
            },

            executable: function () {
                return this._executable;
            }

        }),

        EngineState = _gpfDefine("EngineState", Object, {

            constructor: function () {
                this._stack = [];
                // "Top" dictionary is SYS_DICT
                this._userDict = {};     // Then user dictionary
                this._dictionaries = []; // Then any other enqueued
            },

            push: function () {
                var idx;
                for (idx = 0; idx < arguments.length; ++idx) {
                    this._stack.push(arguments[idx]);
                }
                // Handle stackoverflow
            },

            pop: function () {
                if (0 === this._stack.length) {
                    throw gpf.Error.engineStackUnderflow();
                }
                return this._stack.pop();
            },

            checkAndPop: function (types) {
                var result, idx, value;
                if (this.length() < types.length) {
                    throw gpf.Error.engineStackUnderflow();
                }
                result = [];
                for (idx = 0; idx < types.length; ++idx) {
                    value = this.internalGet(idx);
                    if (toType(value) !== types[idx]) {
                        throw gpf.Error.engineTypeCheck();
                    }
                    result.push(value);
                }
                // TODO: optimize
                while (idx) {
                    this.pop();
                    --idx;
                }
                return result;
            },

            internalGet: function (offset) {
                // WARNING: no check on stack size
                return this._stack[this._stack.length - offset - 1];
            },

            length: function () {
                return this._stack.length;
            }

        });


    _gpfDefine("gpf.Engine", Object, {

        constructor: function () {
            this._state = new EngineState();
        },

        execute: function (src) {
            gpf.interfaces.ignoreParameter(src);
            gpf.interfaces.ignoreParameter(SYS_DICT);

        }

    });

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/
