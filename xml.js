/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    /*jshint forin:false*/ // Need to inspect all members of the prototype

    var
        // Namespaces shortcut
        gpfI = gpf.interfaces,
        gpfA = gpf.attributes
/*
        // XML Parser constants
        _XMLPARSER_STATE_NONE = 0
*/
        ;

    gpf.xml = {};

    /**
     * Defines the possibility for the object to be saved as XML
     *
     * @class gpf.interfaces.IXmlSerializable
     * @extends gpf.interfaces.Interface
     */
    gpf._defIntrf("IXmlSerializable", {

        /**
         * Translate obj into an gpf.interfaces.IXmlContentHandler and serialize
         * itself into XML
         *
         * @param {gpf.interfaces.IXmlContentHandler} out XML Content handler
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready
         */
        "[toXml]": [gpf.$ClassEventHandler()],
        toXml: function (out, eventsHandler) {
            gpfI.ignoreParameter(out);
            gpfI.ignoreParameter(eventsHandler);
        }

    });

    /**
     * Defines the possibility for an object to receive XML serialization events
     *
     * @class gpf.interfaces.IXmlContentHandler
     * @extends gpf.interfaces.Interface
     *
     * Inspired from
     * http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
     */
    gpf._defIntrf("IXmlContentHandler", {

        /**
         * Receive notification of character data
         *
         * @param {String} buffer characters
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready
         */
        "[characters]": [gpf.$ClassEventHandler()],
        characters: function (buffer, eventsHandler) {
            gpfI.ignoreParameter(buffer);
            gpfI.ignoreParameter(eventsHandler);
        },

        /**
         * Receive notification of the end of a document
         *
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready
         */
        "[endDocument]": [gpf.$ClassEventHandler()],
        endDocument: function (eventsHandler) {
            gpfI.ignoreParameter(eventsHandler);
        },

        /**
         * Signal the end of an element
         *
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready
         */
        "[endElement]": [gpf.$ClassEventHandler()],
        endElement: function (eventsHandler) {
            gpfI.ignoreParameter(eventsHandler);
        },

        /**
         *  End the scope of a prefix-URI mapping
         *
         * @param {String} prefix
         *
         * @event ready
         */
        endPrefixMapping: function (prefix) {
            gpfI.ignoreParameter(prefix);
        },

        /**
         * Receive notification of ignorable whitespace in element content
         *
         * @param {String} buffer characters
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready
         */
        "[ignorableWhitespace]": [gpf.$ClassEventHandler()],
        ignorableWhitespace: function (buffer, eventsHandler) {
            gpfI.ignoreParameter(buffer);
            gpfI.ignoreParameter(eventsHandler);
        },

        /**
         * Receive notification of a processing instruction
         *
         * @param {String} target
         * @param {String} data
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready
         */
        "[processingInstruction]": [gpf.$ClassEventHandler()],
        processingInstruction: function (target, data, eventsHandler) {
            gpfI.ignoreParameter(target);
            gpfI.ignoreParameter(data);
            gpfI.ignoreParameter(eventsHandler);
        },

        /**
         * Receive an object for locating the origin of SAX document events.
         *
         * @param {*} locator
         */
        setDocumentLocator: function (locator) {
            gpfI.ignoreParameter(locator);
        },

        /**
         * Receive notification of a skipped entity
         *
         * @param {String} name
         */
        skippedEntity: function (name) {
            gpfI.ignoreParameter(name);
        },

        /**
         * Receive notification of the beginning of a document
         *
         * @param {gpf.events.Handler} eventsHandler
         */
        "[startDocument]": [gpf.$ClassEventHandler()],
        startDocument: function (eventsHandler) {
            gpfI.ignoreParameter(eventsHandler);
        },

        /**
         * Receive notification of the beginning of an element
         *
         * @param {String} uri [uri=""] namespace uri (if any)
         * @param {String} localName
         * @param {String} [qName=localName] qName qualified name
         * @param {Object} attributes attribute dictionary (string/string)
         * @param {gpf.events.Handler} eventsHandler
         */
        "[startElement]": [gpf.$ClassEventHandler()],
        startElement: function (uri, localName, qName, attributes,
            eventsHandler) {
            gpfI.ignoreParameter(uri);
            gpfI.ignoreParameter(localName);
            gpfI.ignoreParameter(qName);
            gpfI.ignoreParameter(attributes);
            gpfI.ignoreParameter(eventsHandler);
        },

        /**
         * Begin the scope of a prefix-URI Namespace mapping
         *
         * @param {String} prefix
         * @param {String} uri
         */
        startPrefixMapping: function (prefix, uri) {
            gpfI.ignoreParameter(prefix);
            gpfI.ignoreParameter(uri);
        }

    });

    var

        //region XML attributes

        /**
         * XML attribute (base class).
         * once the attribute is assigned to an object, it implements the
         * IXmlSerializable interface
         *
         * @class gpf.attributes.XmlAttribute
         * @extends gpf.attributes.Attribute
         * @private
         */
        _Base = gpf._defAttr("XmlAttribute", {

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
                        gpfA.add(objPrototype.constructor, "Class",
                            [gpf.$InterfaceImplement(gpfI.IXmlSerializable)]);
                        objPrototype.toXml = _toXml;
                        // Declare IXmlContentHandler interface through IUnknown
                        gpfA.add(objPrototype.constructor, "Class",
                            [gpf.$InterfaceImplement(gpfI.IXmlContentHandler,
                                _fromXml)]);
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
        _Ignore = gpf._defAttr("$XmlIgnore", _Base, {}),

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
        _Attribute = gpf._defAttr("$XmlAttribute", _Base, {

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
                    gpf.ASSERT(gpf.xml.isValidName(name),
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
        _RawElement = gpf._defAttr("XmlRawElementAttribute", _Base, {

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
                    gpf.ASSERT(gpf.xml.isValidName(name),
                        "Valid XML element name");
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
        _Element = gpf._defAttr("$XmlElement", _RawElement, {

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
        _List = gpf._defAttr("$XmlList", _RawElement, {}),

        //endregion

        //region TO XML

        /**
         * Select the attribute related to the value type
         *
         * @param {gpf.attributes.Array} array Attribute array
         * @param {Object} value
         * @return {null|gpf.attributes.Attribute}
         * @private
         */
        _selectByType = function (array, value) {
            var
                idx,
                attribute,
                defaultResult = null,
                result = null,
                attObjClass;
            for (idx = 0; idx < array.length(); ++idx) {
                attribute = array.get(idx);
                if (!(attribute instanceof _Element)) {
                    continue;
                }
                attObjClass = attribute.objClass();
                if (attObjClass) {
                    if (value instanceof attObjClass) {
                        /*
                         * If no result attribute has been set
                         * OR if the new attribute is a 'child' class of the
                         * existing result (meaning the new attribute is 'more'
                         * specific)
                         */
                        if (!result || attObjClass.prototype
                            instanceof result.objClass()) {
                            result = attribute;
                        }
                    }
                }
                else if (!defaultResult) {
                    defaultResult = attribute;
                }
            }
            if (null !== result) {
                return result;
            } else {
                return defaultResult;
            }
        },

        /**
         * Decide if the member value must be serialized as an attribute (and
         * return its name) or as a sub node (empty result)
         *
         * @param {String} member
         * @param {*} value
         * @param {String} type
         * @param {gpf.attributes.Array} attArray
         * @return {String} "" if the member should be serialized as a sub
         *          node, otherwise the name to apply
         * @private
         */
        _objMemberValueIsAttribute = function /*gpf:inline*/ (member, value,
            type, attArray) {
            var attribute;
            // Check if list or element
            if (value instanceof Array || attArray.has(_List)
                || "object" === type || attArray.has(_Element)) {
                return ""; // Not an attribute
            }
            // Else attribute
            attribute = attArray.has(_Attribute);
            if (attribute && attribute.name()) {
                member = attribute.name();
            } else {
                if ("_" === member.charAt(0)) {
                    member = member.substr(1);
                }
            }
            return member;
        },

        /**
         * Convert the object member into XML using the provided XML content
         * handler
         *
         * @param {Object} obj
         * @param {String} member Member name
         * @param {gpf.interfaces.wrap(IXmlContentHandler)} wrapper
         * @param {gpf.attributes.Map} attMap Map filled with XML attributes
         * @private
         */
        _objMemberToSubNodes = function /*gpf:inline*/ (obj, member,
            wrapper, attMap) {
            var
                value,
                attArray,
                attribute,
                closeNode,
                idx,
                subValue,
                type,
                name;
            value = obj[member];
            // Exception for dates
            if (value instanceof Date) {
                value = gpf.dateToComparableFormat(value, true);
            }
            attArray = attMap.member(member);
            if ("_" === member.charAt(0)) {
                member = member.substr(1);
            }
            // Check if list
            attribute = attArray.has(_List);
            if (value instanceof Array || attribute) {
                // TODO: what to do when value is empty?
                if (attribute && attribute.name()) {
                    closeNode = true;
                    wrapper.startElement("",
                        attribute.name());
                }
                // Get the list of 'candidates'
                attArray = attArray.filter(_Element);
                for (idx = 0; idx < value.length; ++idx) {
                    subValue = value[ idx ];
                    // Select the right candidate
                    type = _selectByType(attArray, subValue);
                    if (type && type.name()) {
                        name = type.name();
                    } else {
                        name = "item";
                    }
                    _toContentHandler(subValue, wrapper,
                        name);
                }
                if (closeNode) {
                    wrapper.endElement();
                }
                return;
            }
            attribute = attArray.has(_Element);
            // Element
            if (attribute && attribute.name()) {
                name = attribute.name();
            }
            _toContentHandler(value, wrapper, name);
        },

        /**
         * Convert the object into XML using the provided XML content handler
         *
         * @param {Object} obj
         * @param {gpf.interfaces.wrap(IXmlContentHandler)} wrapper
         * @param {String} [name="object"] name Name of the root node
         * @param {gpf.attributes.Map} attMap Map filled with XML attributes
         * @private
         */
        _objPrototypeToContentHandler = function /*gpf:inline*/ (obj,
            wrapper, name, attMap) {
            var
                attArray,
                member,
                value,
                type,
                attName,
                subNodeMembers = 0,
                xmlAttributes = 0,
                idx;
            /*
             * WARNING: the prototype is used instead of the object itself
             * This is done to respect the order provided in the prototype
             * (order that can be overridden through the object).
             * Furthermore, this guarantees we serialize only 'members'
             * coming from the 'class' definition.
             * It needs two passes:
             * - one for attributes,
             * - another one for sub nodes
             */
            for (member in obj.constructor.prototype) {
                /*
                 * I must also use inherited properties
                 * NO hasOwnProperty
                 */
                value = obj[member];
                // Exception for dates
                if (value instanceof Date) {
                    value = gpf.dateToComparableFormat(value, true);
                }
                type = typeof value;
                // Skip functions
                if ("function" === type) {
                    continue;
                }
                // Check member's attributes
                attArray = attMap.member(member);
                // Ignore?
                if (attArray.has(_Ignore)) {
                    continue;
                }
                // Decide if attribute or subNode
                attName = _objMemberValueIsAttribute(member, value, type,
                    attArray);
                if (attName) {
                    if (0 === xmlAttributes) {
                        xmlAttributes = {};
                    }
                    xmlAttributes[attName] = value.toString();
                } else {
                    // Subnode
                    if (0 === subNodeMembers) {
                        subNodeMembers = [];
                    }
                    subNodeMembers.push(member);
                }
            }
            wrapper.startElement("", name, name, xmlAttributes);
            if (subNodeMembers) {
                for (idx = 0; idx < subNodeMembers.length; ++idx) {
                    _objMemberToSubNodes(obj, subNodeMembers[idx],
                        wrapper, attMap);
                }
            }
        },

        /**
         * Convert the parameter into XML using the provided XML content handler
         *
         * @param {*} obj
         * @param {gpf.interfaces.wrap(IXmlContentHandler)} wrapper
         * @param {String} [name="object"] name Name of the root node
        * @private
         */
        _toContentHandler = function (obj, wrapper, name) {
            var
                attMap = (new gpfA.Map(obj)).filter(_Base),
                attribute;
            // If no 'name', check the Class attribute
            if (!name) {
                attribute = attMap.member("Class").has(_Element);
                if (attribute) {
                    name = attribute.name();
                } else {
                    name = gpf.classDef(obj.constructor).name();
                    if (!name) {
                        name = "object";
                    }
                }
            }
            // If not an object, serialize the textual representation
            if ("object" !== typeof obj) {
                wrapper.startElement("", name);
                wrapper.characters(gpf.value(obj, ""));
            } else {
                _objPrototypeToContentHandler(obj, wrapper, name,
                    attMap);
            }
            wrapper.endElement();
        },

        /**
         * Converts this into XML using the provided XML content handler
         *
         * @@implements gpf.interfaces.IIXmlSerializable:toXml
         * @private
         */
        _toXml = function (out, eventsHandler) {
            var
                WXmlContentHandler =
                    gpf.interfaces.wrap(gpfI.IXmlContentHandler),
                wrapped = new WXmlContentHandler(out);
            wrapped
                .$catch(eventsHandler)
                .$finally(eventsHandler, "ready");
            _toContentHandler(this, wrapped);
        },

        //endregion

        //region FROM XML

        /**
         * Class to handle object un-serialization from XML
         *
         * @class FromXmlContentHandler
         * @implements gpf.interfaces.IXmlContentHandler
         * @private
         */
        FromXmlContentHandler = gpf.define("FromXmlContentHandler", {

            // Even if it is not necessary, let be precise
            "[Class]": [gpf.$InterfaceImplement(gpfI.IXmlContentHandler)],

            _target: null,                          // Object that is serialized
            _firstElement: true,             // startElement has not been called
            _forward: [],                                 // subsequent handlers
            /*
                {
                    {number} type
                                0 IXmlContentHandler
                                1 Element
                                2 List
                    {object} iXCH
                    {string} member
                    {string[]} buffer
                    {number} depth
                }
             */

            constructor: function (target) {
                this._target = target;
                this._firstElement = true;
                this._forward = [];
            },

            _fillFromAttributes: function (attributes) {
                var
                    xmlAttributes = new gpfA.Map(this._target),
                    targetProto = this._target.constructor.prototype,
                    member,
                    attArray,
                    attName;
                for (member in targetProto) {
                    if ("function" === typeof targetProto[member]) {
                        continue; // ignore
                    }
                    attArray = xmlAttributes
                        .member(member)
                        .filter(_Attribute);
                    if (0 < attArray.length()) {
                        gpf.ASSERT(attArray.length() === 1,
                            "Expected one attribute only");
                        attName = attArray.get(0).name();
                    } else {
                        // Only private are serialized by default as att.
                        if (member.charAt(0) === "_") {
                            attName = member.substr(1);
                        } else {
                            continue; // ignore
                        }
                    }
                    if (attName in attributes) {
                        this._target[member] =
                            gpf.value(attributes[attName], targetProto[member]);
                    }
                }
            },

            _fillFromElement: function (uri, localName, qName, attributes) {
                var
                    xmlAttributes = new gpfA.Map(this._target)
                        .filter(_RawElement),
                    forward = this._forward[0],
                    members,
                    idx,
                    member,
                    attArray,
                    jdx,
                    attribute;
                gpf.interfaces.ignoreParameter(uri);
                gpf.interfaces.ignoreParameter(qName);
                gpf.interfaces.ignoreParameter(attributes);
                // If
                if (undefined === forward) {
                    // No forward, check all members
                    members = xmlAttributes.members();
                } else {
                    // At least one forward exists, it is related to a member
                    gpf.ASSERT(forward.type !== 0, "No content handler here");
                    members = [forward.member];
                }
                for (idx = 0; idx < members.length; ++idx) {
                    member = members[idx];
                    attArray = xmlAttributes.member(member);
                    for (jdx = 0; jdx < attArray.length(); ++jdx) {
                        attribute = attArray.get(jdx);
                        // TODO handle namespaces
                        if (attribute.name() === localName) {
                            // Attribute found, try
                            if (this._fillFromRawElement(member, attribute)) {
                                return;
                            }
                        }
                    }
                }
                // Ignore?
            },

            _fillFromRawElement: function (member, attribute) {
                var
                    obj,
                    forward;
                if (attribute instanceof _Element) {
                    // Build new object and assign it to the member
                    if (attribute.objClass()) {
                        obj = new (attribute.objClass())();
                        this._target[member] = obj;
                        // Query IXmlContentHandler
                        forward = gpfI.query(obj, gpfI.IXmlContentHandler);
                    }
                    if (forward) {
                        forward = {
                            type: 0,
                            iXCH: forward
                        };
                    } else {
                        forward = {
                            type: 1,
                            member: member,
                            buffer: []
                        };
                    }
                } else if (attribute instanceof _List) {
                    // The member is an array of objects
                    this._target[member] = [];
                    forward = {
                        type: 2,
                        member: member
                    };
                }
                if (forward) {
                    forward.depth = 1;
                    this._forward.unshift(forward);
                    return true;
                } else {
                    return false;
                }
            },

            //region gpf.interfaces.IXmlContentHandler

            /**
             * @implements gpf.interfaces.IXmlContentHandler:characters
             */
            characters: function (buffer, eventsHandler) {
                var forward = this._forward[0];
                if (undefined !== forward) {
                    if (0 === forward.type) {
                        forward.iXCH.characters.apply(forward.iXCH, arguments);
                    } else if (1 === forward.type) {
                        forward.buffer.push(buffer);
                    }
                }
                gpf.events.fire.apply(this, ["ready", eventsHandler]);
            },

            /**
             * @implements gpf.interfaces.IXmlContentHandler:endDocument
             */
            endDocument: function (eventsHandler) {
                gpf.events.fire.apply(this, ["ready", eventsHandler]);
            },

            /**
             * @implements gpf.interfaces.IXmlContentHandler:endElement
             */
            endElement: function (eventsHandler) {
                var
                    forward = this._forward[0],
                    memberValue,
                    textValue;
                if (undefined !== forward) {
                    if (0 === forward.type) {
                        forward.iXCH.endElement.apply(forward.iXCH, arguments);
                    } else if (1 === forward.type) {
                        memberValue = this._target[forward.member];
                        textValue = forward.buffer.join("");
                        if (memberValue instanceof Array) {
                            memberValue.push(textValue);
                        } else {
                            this._target[forward.member] = gpf.value(textValue,
                                memberValue);
                        }
                    } /*else if (2 === forward.type) {
                        // Nothing to do

                    } */
                    if (0 === --forward.depth) {
                        this._forward.shift();
                    }
                }
                gpf.events.fire.apply(this, ["ready", eventsHandler]);
            },

            /**
             * @implements gpf.interfaces.IXmlContentHandler:endPrefixMapping
             */
            endPrefixMapping: function (prefix) {
                // Nothing to do (?)
                gpfI.ignoreParameter(prefix);
            },

            /**
             * @implements gpf.interfaces.IXmlContentHandler:ignorableWhitespace
             */
            ignorableWhitespace: function (buffer, eventsHandler) {
                // Nothing to do
                gpfI.ignoreParameter(buffer);
                gpf.events.fire.apply(this, ["ready", eventsHandler]);
            },

            /**
             * @implements gpf.interfaces
             *             .IXmlContentHandler:processingInstruction
             */
            processingInstruction: function (target, data, eventsHandler) {
                // Not relevant
                gpfI.ignoreParameter(target);
                gpfI.ignoreParameter(data);
                gpf.events.fire.apply(this, ["ready", eventsHandler]);
            },

            /**
             * @implements gpf.interfaces.IXmlContentHandler:setDocumentLocator
             */
            setDocumentLocator: function (locator) {
                // Nothing to do
                gpfI.ignoreParameter(locator);
            },

            /**
             * @implements gpf.interfaces.IXmlContentHandler:skippedEntity
             */
            skippedEntity: function (name) {
                // Nothing to do
                gpfI.ignoreParameter(name);
            },

            /**
             * @implements gpf.interfaces.IXmlContentHandler:startDocument
             */
            startDocument: function (eventsHandler) {
                // Nothing to do
                gpf.events.fire.apply(this, ["ready", eventsHandler]);
            },

            /**
             * @implements gpf.interfaces.IXmlContentHandler:startElement
             */
            startElement: function (uri, localName, qName, attributes,
                eventsHandler) {
                var
                    forward = this._forward[0];
                gpf.interfaces.ignoreParameter(uri);
                gpf.interfaces.ignoreParameter(localName);
                gpf.interfaces.ignoreParameter(qName);
                if (undefined !== forward) {
                    if (0 === forward.type) {
                        ++forward.depth;
                        forward.iXCH.startElement.apply(forward.iXCH,
                            arguments);
                    } else {
                        this._fillFromElement.apply(this, arguments);
                    }
                } else if (this._firstElement) {
                    this._firstElement = false;
                    /*
                     * First time startElement is called, ignore localName
                     * but process attributes.
                     */
                    this._fillFromAttributes(attributes);
                } else {
                    /*
                     * Elements are used to introduce a sub-object
                     */
                    this._fillFromElement.apply(this, arguments);
                }
                gpf.events.fire.apply(this, ["ready", eventsHandler]);
            },

            /**
             * @implements gpf.interfaces.IXmlContentHandler:startPrefixMapping
             */
            startPrefixMapping: function (prefix, uri) {
                // Nothing to do (?)
                gpfI.ignoreParameter(prefix);
                gpfI.ignoreParameter(uri);
            }

            //endregion

        }),

        _fromXml = function (target) {
            return new FromXmlContentHandler(target);
        };

        // endregion

    //region XML Writer

    /**
     * A class to serialize an XML into a string
     *
     * @class gpf.xml.Writer
     * @implements gpf.interfaces.IXmlContentHandler
     */
    gpf.define("gpf.xml.Writer", {

        "[Class]": [gpf.$InterfaceImplement(gpfI.IXmlContentHandler)],

        private: {

            /**
             * @type {gpf.interfaces.IWritableStream}
             * @private
             */
            _stream: null,

            /**
             * @type {Boolean[]}
             * @private
             */
            _branch: [],

            /**
             * @type {String[]}
             * @private
             */
            _pendingPrefixMappings: [],

            /**
             * @type {String[]}
             * @private
             */
            _buffer: [],

            /**
             * @type {gpf.events.Handler}
             * @private
             */
            _eventsHandler: null,

            /**
             * Close the current tag (if opened) in order to put content in it
             *
             * @private
             */
            _closeLeafForContent: function() {
                var leaf;
                if (this._branch.length) {
                    leaf = this._branch[this._branch.length - 1];
                    if (!leaf.hasContent) {
                        this._buffer.push(">");
                        leaf.hasContent = true;
                    }
                }
            },

            /**
             * Flush the buffer into the stream
             *
             * @param {gpf.events.Handler} eventsHandler
             * @private
             */
            _flush: function (eventsHandler) {
                this._eventsHandler = eventsHandler;
                this._flushed();
            },

            /**
             * Handle write event on stream
             *
             * @param {gpf.events.Event} event
             * @private
             */
            _flushed: function (event) {
                var
                    eventsHandler;
                if (event
                    && event.type() === gpfI.IWritableStream.EVENT_ERROR) {
                    gpf.events.fire.apply(this, [
                        event,
                        this._eventsHandler
                    ]);
                } else if (0 === this._buffer.length) {
                    eventsHandler = this._eventsHandler;
                    this._eventsHandler = null;
                    gpf.events.fire.apply(this, [
                        gpfI.IWritableStream.EVENT_READY,
                        eventsHandler
                    ]);
                } else {
                    this._stream.write(this._buffer.shift(),
                        gpf.Callback.bind(this, "_flushed"));
                }
            }

        },

        public: {

            /**
             * @param {gpf.interfaces.IWritableStream} stream
             * @constructor
             */
            constructor: function(stream) {
                this._stream = gpfI.query(stream, gpfI.IWritableStream, true);
                this._branch = [];
                this._pendingPrefixMappings = [];
                this._buffer = [];
            },

            //region gpf.interfaces.IXmlContentHandler

            /**
             * @implements gpf.interfaces.IXmlContentHandler:characters
             */
            characters: function (buffer, eventsHandler) {
                gpf.ASSERT(null === this._eventsHandler, "Write in progress");
                this._closeLeafForContent();
                this._buffer.push(buffer);
                this._flush(eventsHandler);
            },

            /**
             * @implements gpf.interfaces.IXmlContentHandler:endDocument
             */
            endDocument: function (eventsHandler) {
                gpf.ASSERT(null === this._eventsHandler, "Write in progress");
                // Nothing to do
                this._flush(eventsHandler);
            },

            /**
             * @implements gpf.interfaces.IXmlContentHandler:endElement
             */
            endElement: function (eventsHandler) {
                gpf.ASSERT(null === this._eventsHandler, "Write in progress");
                var
                    leaf = this._branch.pop();
                if (leaf.hasContent) {
                    this._buffer.push("</", leaf.qName, ">");
                } else {
                    this._buffer.push("/>");
                }
                this._flush(eventsHandler);
            },

            /**
             * @implements gpf.interfaces.IXmlContentHandler:endPrefixMapping
             */
            endPrefixMapping: function (prefix) {
                // Nothing to do (?)
                gpf.interfaces.ignoreParameter(prefix);
            },

            /**
             * @implements gpf.interfaces.IXmlContentHandler:ignorableWhitespace
             */
            ignorableWhitespace: function (buffer, eventsHandler) {
                gpf.ASSERT(null === this._eventsHandler, "Write in progress");
                this._closeLeafForContent();
                this._buffer.push(buffer);
                this._flush(eventsHandler);
            },

            /**
             * @implements gpf.interfaces.IXmlContentHandler:
             * processingInstruction
             */
            processingInstruction: function (target, data, eventsHandler) {
                gpf.ASSERT(null === this._eventsHandler, "Write in progress");
                this._buffer.push("<?", target, " ", gpf.escapeFor(data, "xml"),
                    "?>");
                this._flush(eventsHandler);
            },

            /**
             * @implements gpf.interfaces.IXmlContentHandler:setDocumentLocator
             */
            setDocumentLocator: function (locator) {
                // Nothing to do
                gpf.interfaces.ignoreParameter(locator);
            },

            /**
             * @implements gpf.interfaces.IXmlContentHandler:skippedEntity
             */
            skippedEntity: function (name) {
                // Nothing to do
                gpf.interfaces.ignoreParameter(name);
            },

            /**
             * @implements gpf.interfaces.IXmlContentHandler:startDocument
             */
            startDocument: function (eventsHandler) {
                gpf.ASSERT(null === this._eventsHandler, "Write in progress");
                // Nothing to do
                this._flush(eventsHandler);
            },

            /**
             * @implements gpf.interfaces.IXmlContentHandler:startElement
             */
            startElement: function (uri, localName, qName, attributes,
                eventsHandler) {
                gpf.ASSERT(null === this._eventsHandler, "Write in progress");
                var
                    attName,
                    attValue,
                    len,
                    idx;
                if (undefined === qName && !uri) {
                    qName = localName;
                }
                this._closeLeafForContent();
                var leaf = {
                    hasContent: false,
                    qName: qName
                };
                this._branch.push(leaf);
                this._buffer.push("<", qName);
                if (attributes) {
                    for (attName in attributes) {
                        if (attributes.hasOwnProperty(attName)) {
                            this._buffer.push(" ", attName, "=\"");
                            attValue = gpf.escapeFor(
                                attributes[attName].toString(), "xml");
                            if (-1 < attValue.indexOf("\"")) {
                                attValue = gpf.replaceEx(attValue, {
                                    "\"": "&quot;"
                                });
                            }
                            this._buffer.push(attValue, "\"");
                        }
                    }
                }
                len = this._pendingPrefixMappings.length;
                if (len) {
                    for (idx = 0; idx < len; ++idx) {
                        this._buffer.push(" ",
                            this._pendingPrefixMappings[idx]);
                    }
                    this._pendingPrefixMappings = [];
                }
                this._flush(eventsHandler);
            },

            /**
             * @implements gpf.interfaces.IXmlContentHandler:startPrefixMapping
             */
            startPrefixMapping: function (prefix, uri) {
                this._pendingPrefixMappings.push(["xmlns:", prefix, ":\"",
                    gpf.escapeFor(uri, "xml"), "\""].join(""));
            }

            //endregion

        }

    });

    //endregion

    //region XML Parser
/* TBD
    gpf.xml.Parser = gpf.Parser.extend({

        _contentHandler: null,

        constructor: function (contentHandler) {
            this._contentHandler = contentHandler;
        },

        _parse: function (char) {

            if (_XMLPARSER_STATE_NONE === this._state) {
                
            }

        },

        _reset: function () {

        }

    });
*/
    //endregion

    //region Parsing

    /**
     * Tries to convert any value into XML
     *
     * @param {*} value
     * @param {Object} out Recipient object for XML serialization
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event ready
     */
    gpf.xml.convert = function (value, out, eventsHandler) {
        var
            iXmlSerializable;
        if ("string" === typeof value) {
            gpf.Error.NotImplemented();
        } else if ("object" === typeof value) {
            iXmlSerializable = gpfI.query(value, gpfI.IXmlSerializable);
            if (null === iXmlSerializable) {
                iXmlSerializable = new gpf.xml.ConstNode(value);
            }
            iXmlSerializable.toXml(out, eventsHandler);
        }
    };

    //endregion

    //region Helpers

    var
        _firstValidChar = gpf._alpha + gpf._ALPHA + "_",
        _otherValidChars = _firstValidChar + "012345789.-";

    gpf.extend(gpf.xml, {

        /**
         * Check that the provided name can be use as an element or attribute
         * name
         *
         * @param {String} name
         * @return {Boolean}
         */
        isValidName: function (name) {
            var
                idx;
            if (0 === name.length
                || -1 === _firstValidChar.indexOf(name.charAt(0))) {
                return false;
            }
            for (idx = 1; idx < name.length; ++idx) {
                if (-1 === _otherValidChars.indexOf(name.charAt(idx))) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Make sure that the provided name can be use as an element or
         * attribute name
         *
         * @param {String} name
         * @return {String} a valid attribute/element name
         */
        toValidName: function (name) {
            var newName;
            if (gpf.xml.isValidName(name)) {
                return name;
            }
            // Try with a starting _
            newName = "_" + name;
            if (!gpf.xml.isValidName(newName)) {
                gpf.Error.XmlInvalidName();
            }
            return newName;
        }

    });

    //endregion

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/