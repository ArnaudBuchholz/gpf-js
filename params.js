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
                    result = new gpf.Parameter();
                gpf.json.load(result, definition);
                // name is required
                if (!result._name) {
                    gpf.Error.ParamsNameRequired();
                }
                return result;
            },

            /**
             * Parse the arguments and return an object with the
             * recognized parameters. Throws an error.
             *
             * @param {gpf.Parameter[]} parameters
             * @param {String[]} values
             * @return {Object}
             */
            parse: function (parameters, values) {
                gpf.interface.ignoreParameter(parameters);
                gpf.interface.ignoreParameter(values);
                return {};
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