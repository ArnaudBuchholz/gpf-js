/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    gpf.define("gpf.Parameter", {

        private: {

            /**
             * Name
             *
             * @type {String}
             * @private
             */
            "[_name]": [gpf.$ClassProperty(), gpf.$XmlAttribute("name")],
            _name: "",

            /**
             * Description
             *
             * @type {String}
             * @private
             */
            "[_description]": [gpf.$ClassProperty(),
                gpf.$XmlElement("description")],
            _description: "",

            /**
             * Type
             *
             * @type {String} see gpf.Parameter.TYPE_xxx
             * @private
             */
            "[_type]": [gpf.$ClassProperty(), gpf.$XmlAttribute("type")],
            _type: "string",

            /**
             * Is required
             *
             * @type {Boolean}
             * @private
             */
            "[_required]": [gpf.$ClassProperty(),
                gpf.$XmlAttribute("required")],
            _required: false,

            /**
             * Default value to apply if not specified
             *
             * @type {*}
             * @private
             */
            "[_defaultValue]": [gpf.$ClassProperty(),
                gpf.$XmlElement("default")],
            _defaultValue: undefined,

            /**
             * Prefix used to locate parameter in the given parameter list.
             * NOTE: required parameter may not specify any prefix: they are
             * have to be specified in the correct order (and they can't be
             * multiple)
             *
             * @type {String}
             * @private
             */
            "[_prefix]": [gpf.$ClassProperty(), gpf.$XmlAttribute("prefix")],
            _prefix: "",

            /**
             * Multiple parameter means they can be specified more than once.
             * The parameter value would be then an array.
             *
             * @type {Boolean}
             * @private
             */
            "[_multiple]": [gpf.$ClassProperty(),
                gpf.$XmlAttribute("multiple")],
            _multiple: false,

            /**
             * Hidden parameters are not displayed when calling usage
             *
             * @type {Boolean}
             * @private
             */
            "[_hidden]": [gpf.$ClassProperty(), gpf.$XmlAttribute("hidden")],
            _hidden: false
        },

        public: {

        },

        static: {

            TYPE_BOOLEAN: "boolean",
            TYPE_NUMBER: "number",
            TYPE_STRING: "string",

            DEFAULTS: {
                "string": "",
                "boolean": false,
                "number": 0
            },

            /**
             * Create a list of parameters
             *
             * @param {Object[]} definitions
             * @return {gpf.Parameter[]}
             */
            create: function (definitions) {
                var
                    result = [],
                    len = definitions.length,
                    idx;
                for (idx = 0; idx < len; ++idx) {
                    result.push(this._createFromObject(definitions[idx]));
                }
                return result;
            },

            /**
             * Create a parameter from the definition object
             *
             * @param {Object} definition
             * @return {gpf.Parameter}
             * @private
             */
            _createFromObject: function (definition) {
                var
                    result = new gpf.Parameter(),
                    typeDefaultValue;
                if (definition.prefix === "verbose") {
                    definition = {
                        name: "verbose",
                        description: "Enable verbose mode",
                        type: "boolean",
                        defaultValue: false,
                        prefix: "verbose"
                    };
                } else if (definition.prefix === "help") {
                    definition = {
                        name: "help",
                        description: "Display help",
                        type: "boolean",
                        defaultValue: false,
                        prefix: "help"
                    };
                }
                gpf.json.load(result, definition);
                // name is required
                if (!result._name) {
                    gpf.Error.ParamsNameRequired();
                }
                // Check type and default value
                typeDefaultValue = this.DEFAULTS.hasOwnProperty(result._type);
                if (undefined === typeDefaultValue) {
                    gpf.Error.ParamsTypeUnknown();
                }
                if (result.hasOwnProperty("_defaultValue")) {
                    result._defaultValue =
                        gpf.value(result._defaultValue, typeDefaultValue,
                            result._type);
                }
                return result;
            },

            /**
             * Helper used to manipulate the list of parameters: retrieve one
             * using prefix. If no prefix is specified or a number is used, get
             * the first parameter with no prefix (starting at N if a number was
             * used).
             *
             * @param {gpf.Parameter[]} parameters
             * @param {String|Number] [prefix=0] prefix
             */
            getOnPrefix: function (parameters, prefix) {
                var
                    len,
                    idx,
                    parameter;
                if (undefined === prefix) {
                    prefix = 0;
                }
                len = parameters.length;
                if ("number" === prefix) {
                    idx = prefix;
                    prefix = "";
                }
                for (; idx < len; ++idx) {
                    parameter = parameters[idx];
                    if (parameter._prefix === prefix) {
                        return parameter;
                    }
                }
                return null;
            },

            /**
             * Parse the arguments and return an object with the
             * recognized parameters. Throws an error if required parameters
             * are missing.
             *
             * @param {gpf.Parameter[]} parameters
             * @param {String[]} argumentsToParse
             * @return {Object}
             */
            parse: function (parameters, argumentsToParse) {
                var
                    result = {},
                    len,
                    idx,
                    argument,
                    parameter,
                    name,
                    lastNonPrefixIdx = 0;
                len = argumentsToParse.length;
                for (idx = 0; idx < len; ++idx) {
                    // Check if a prefix was used
                    argument = this.getPrefixValuePair(argumentsToParse[idx]);
                    if (argument instanceof Array) {
                        parameter = this.getOnPrefix(parameters, argument[0]);
                        argument = argument[1];
                    } else {
                        parameter = this.getOnPrefix(parameters,
                            lastNonPrefixIdx);
                        lastNonPrefixIdx = parameters.indexOf(parameter) + 1;
                    }
                    if (!parameter) {
                        // Nothing to do with this value, ignore?
                        continue;
                    }
                    // TODO change when type will be an object
                    argument = gpf.value(argument, parameter._defaultValue,
                        parameter._type);
                    name = parameter._name;
                    if (parameter._multiple) {
                        if (undefined === result[name]) {
                            result[name] = [];
                        }
                        result[name].push(argument);
                        if (parameter._prefix === "") {
                            --lastNonPrefixIdx;
                        }

                    } else {
                        // The last one wins
                        result[name] = argument;
                    }
                }
                this._finalizeParse(parameters, result);
                return result;
            },

            /**
             * Check that all required fields are set,
             * apply default values
             *
             * @param {gpf.Parameter[]} parameters
             * @param {Object} result
             * @private
             */
            _finalizeParse: function (parameters, result) {
                var
                    len,
                    idx,
                    parameter,
                    name,
                    value;
                len = parameters.length;
                for (idx = 0; idx < len; ++idx) {
                    parameter = parameters[idx];
                    name = parameter._name;
                    if (undefined === result[name]) {
                        if (parameter._required) {
                            gpf.Error.ParamsRequiredMissing({
                                name: name
                            });
                        }
                    }
                    value = parameter._defaultValue;
                    if (undefined !== value) {
                        if (parameter._multiple) {
                            value = [value];
                        }
                        result[name] = value;
                    }
                }
            },

            /**
             * Split the argument in a prefix / value pair if it makes sense.
             * Otherwise, only the value is returned.
             *
             * Recognized prefixes:
             * <ul>
             *     <li>-{prefix}:</li>
             *     <li>{prefix}=</li>
             * </ul>
             *
             * @param {String} argument
             * @return {String[]|String}
             */
            getPrefixValuePair: function (argument) {
                var pos;
                // -{prefix}:
                if (argument.charAt(0) === "-") {
                    pos = argument.indexOf(":");
                    if (-1 < pos) {
                        return argument.substr(1).split(":");
                    }
                }
                // {prefix}=
                pos = argument.indexOf("=");
                if (-1 < pos) {
                    return argument.substr(1).split("=");
                }
                // Default
                return argument;
            },

            /**
             * Build the usage string for these parameters
             *
             * @param {gpf.Parameter[]} parameters
             * @return {String}
             */
            usage: function (parameters) {
                gpf.interface.ignoreParameter(parameters);
                return "";
            }

        }

    });

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/