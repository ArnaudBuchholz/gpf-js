/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    var

        //region JSON attributes

        /**
         * JSON attribute (base class).
         * once the attribute is assigned to an object, it implements the
         * IXmlSerializable interface
         *
         * @class gpf.attributes.XmlAttribute
         * @extends gpf.attributes.Attribute
         * @private
         */
        _Base = gpf._defAttr("JsonAttribute", {
        });


    /**
     * Load the object properties from the json representation.
     *
     * @param {Object} object
     * @param {Object|string} json
     * @return {Object}
     * @chainable
     */
    gpf.json.load = function (object, json) {

    };

    gpf.json.save = function (object) {

    };

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/