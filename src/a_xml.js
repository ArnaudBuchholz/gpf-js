/*#ifndef(UMD)*/
"use strict";
/*global _gpfAAdd*/ // Shortcut for gpf.attributes.add
/*global _gpfDefAttr*/ // gpf.define for attributes
/*global _gpfFromXml*/ // XML deserializer
/*global _gpfI*/ // gpf.interfaces
/*global _gpfIsValidXmlName*/ // XML name validation
/*global _gpfToXml*/ // XML serializer
/*exported _GpfXmlAttribute*/
/*exported _GpfXmlBase*/
/*exported _GpfXmlElement*/
/*exported _GpfXmlIgnore*/
/*exported _GpfXmlList*/
/*exported _GpfXmlRawElement*/
/*#endif*/

var
    /**
     * XML attribute (base class).
     * once the attribute is assigned to an object, it implements the
     * IXmlSerializable interface
     *
     * @class gpf.attributes.XmlAttribute
     * @extends gpf.attributes.Attribute
     * @private
     */
    _GpfXmlBase = _gpfDefAttr("XmlAttribute", {

        protected: {

            /**
             * @inheritdoc gpf.attributes.Attribute:_alterPrototype
             */
            _alterPrototype: function (objPrototype) {
                /*
                 * If not yet defined creates new XML members
                 * - toXml()
                 * - IXmlContentHandler implementation
                 */
                if (undefined === objPrototype.toXml) {
                    // Declare toXml
                    _gpfAAdd(objPrototype.constructor, "Class",
                        [gpf.$InterfaceImplement(_gpfI.IXmlSerializable)]);
                    objPrototype.toXml = _gpfToXml;
                    // Declare IXmlContentHandler interface through IUnknown
                    _gpfAAdd(objPrototype.constructor, "Class",
                        [gpf.$InterfaceImplement(_gpfI.IXmlContentHandler,
                            _gpfFromXml)]);
                }
            }

        }

    }),

    /**
     * XML Ignore attribute
     * Indicates the member must not be serialized
     *
     * @class gpf.attributes.XmlIgnoreAttribute
     * @extends gpf.attributes.XmlAttribute
     * @alias gpf.$XmlIgnore
     */
    _GpfXmlIgnore = _gpfDefAttr("$XmlIgnore", _GpfXmlBase, {}),
    // TODO replace with $ClassNonSerialized ?

    /**
     * XML Attribute attribute
     * Indicates the member is serialized as an attribute
     *
     * @param {String} name The attribute name
     *
     * @class gpf.attributes.XmlAttributeAttribute
     * @extends gpf.attributes.XmlAttribute
     * @alias gpf.$XmlAttribute
     */
    _GpfXmlAttribute = _gpfDefAttr("$XmlAttribute", _GpfXmlBase, {

        private: {

            /**
             * Name of the attribute
             *
             * @type {String}
             * @private
             */
            "[_name]": [gpf.$ClassProperty()],
            _name: ""

        },

        public: {

            /**
             * @param {String} name Name of the attribute
             * @constructor
             */
            constructor: function (name) {
                gpf.ASSERT(_gpfIsValidXmlName(name),
                    "Valid XML attribute name");
                this._name = name;
            }

        }

    }),

    /**
     * XML RAW Element attribute
     *
     * @param {String} name The element name
     *
     * @class gpf.attributes.XmlRawElementAttribute
     * @extends gpf.attributes.XmlAttribute
     */
    _GpfXmlRawElement = _gpfDefAttr("XmlRawElementAttribute", _GpfXmlBase, {

        private: {

            /**
             * Name of the element
             *
             * @type {String}
             * @private
             */
            "[_name]": [gpf.$ClassProperty()],
            _name: ""

        },

        public: {

            /**
             * @param {String} name Name of the element
             * @constructor
             */
            constructor: function (name) {
                gpf.ASSERT(_gpfIsValidXmlName(name), "Valid XML element name");
                this._name = name;
            }

        }

    }),

    /**
     * XML Element attribute
     * Indicates the member is serialized as an element
     *
     * @param {String} name The element name
     * @param {Function} objClass The class used for un-serializing it
     *
     * @class gpf.attributes.XmlElementAttribute
     * @extends gpf.attributes.XmlRawElementAttribute
     * @alias gpf.$XmlElement
     */
    _GpfXmlElement = _gpfDefAttr("$XmlElement", _GpfXmlRawElement, {

        private: {

            /**
             * Object constructor
             *
             * @type {Function}
             * @private
             */
            "[_objClass]": [gpf.$ClassProperty()],
            _objClass: null

        },

        public: {

            /**
             * @param {String} name Name of the element
             * @param {Function} objClass Object constructor
             * @constructor
             */
            constructor: function (name, objClass) {
                this._super(name);
                if (objClass) {
                    this._objClass = objClass;
                }
            }

        }

    }),

    /**
     * XML List attribute
     * Indicates the member is an array and is serialized inside an element
     *
     * @class gpf.attributes.XmlListAttribute
     * @extends gpf.attributes.XmlRawElementAttribute
     * @alias gpf.$XmlList
     */
    _GpfXmlList = _gpfDefAttr("$XmlList", _GpfXmlRawElement, {});