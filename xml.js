/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    /*jshint forin:false*/ // Need to inspect all members of the prototype

    var
        // Namespaces shortcut
        gpfI = gpf.interfaces,
        gpfA = gpf.attributes,
/*
        // XML Parser constants
        _XMLPARSER_STATE_NONE = 0,
*/
        // This error will be handled in a common way later
        _expectedXmlContentHandler = function () {
            throw {
                message: "Invalid parameter, " +
                    "expected gpf.interfaces.IXmlContentHandler"
            };
        }
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
         */
        toXml: function (out) {
            gpfI.ignoreParameter(out);
        }

    });

    /**
     * Defines the possibility for an object to load XML
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
         */
        characters: function (buffer) {
            gpfI.ignoreParameter(buffer);
        },

        /**
         * Receive notification of the end of a document
         */
        endDocument: function () {},

        /**
         * Signal the end of an element
         */
        endElement: function () {},

        /**
         *  End the scope of a prefix-URI mapping
         *
         * @param {String} prefix
         */
        endPrefixMapping: function (prefix) {
            gpfI.ignoreParameter(prefix);
        },

        /**
         * Receive notification of ignorable whitespace in element content
         *
         * @param {String} buffer characters
         */
        ignorableWhitespace: function (buffer) {
            gpfI.ignoreParameter(buffer);
        },

        /**
         * Receive notification of a processing instruction
         *
         * @param {String} target
         * @param {String} data
         */
        processingInstruction: function (target, data) {
            gpfI.ignoreParameter(target);
            gpfI.ignoreParameter(data);
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
         */
        startDocument: function () {},

        /**
         * Receive notification of the beginning of an element
         *
         * @param {String} uri [uri=""] namespace uri (if any)
         * @param {String} localName
         * @param {String} [qName=localName] qName qualified name
         * @param {Object} attributes attribute dictionary (string/string)
         */
        startElement: function (uri, localName, qName, attributes) {
            gpfI.ignoreParameter(uri);
            gpfI.ignoreParameter(localName);
            gpfI.ignoreParameter(qName);
            gpfI.ignoreParameter(attributes);
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

            alterPrototype: function (objPrototype) {
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

        }),

        /**
         * XML Ignore attribute
         * Indicates the member must not be serialized
         *
         * @class gpf.attributes.XmlIgnoreAttribute
         * @extends gpf.attributes.XmlAttribute
         * @alias gpf.$XmlIgnore
         */
        _Ignore = gpf._defAttr("$XmlIgnore", _Base, {

//            "[Class]": [gpf.$Alias("XmlIgnore")]

        }),

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

//            "[Class]": [gpf.$Alias("XmlAttribute")],

            "[_name]": [gpf.$ClassProperty()],
            _name: "",

            init: function (name) {
                gpf.ASSERT(gpf.xml.isValidName(name),
                    "Valid XML attribute name");
                this._name = name;
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

            "[_name]": [gpf.$ClassProperty()],
            _name: "",

            init: function (name) {
                gpf.ASSERT(gpf.xml.isValidName(name),
                    "Valid XML element name");
                this._name = name;
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

//            "[Class]": [gpf.$Alias("XmlElement")],

            "[_objClass]": [gpf.$ClassProperty()],
            _objClass: null,

            init: function (name, objClass) {
                this._super(name);
                if (objClass) {
                    this._objClass = objClass;
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
        _List = gpf._defAttr("$XmlList", _RawElement, {

//            "[Class]": [gpf.$Alias("XmlList")]

        }),

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
         * @param {gpf.interfaces.IXmlContentHandler} contentHandler
         * @param {gpf.attributes.Map} attMap Map filled with XML attributes
         * @private
         */
        _objMemberToSubNodes = function /*gpf:inline*/ (obj, member,
            contentHandler, attMap) {
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
                    contentHandler.startElement("",
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
                    _toContentHandler(subValue, contentHandler,
                        name);
                }
                if (closeNode) {
                    contentHandler.endElement();
                }
                return;
            }
            attribute = attArray.has(_Element);
            // Element
            if (attribute && attribute.name()) {
                name = attribute.name();
            }
            _toContentHandler(value, contentHandler, name);
        },

        /**
         * Convert the object into XML using the provided XML content handler
         *
         * @param {Object} obj
         * @param {gpf.interfaces.IXmlContentHandler} contentHandler
         * @param {String} [name="object"] name Name of the root node
         * @param {gpf.attributes.Map} attMap Map filled with XML attributes
         * @private
         */
        _objPrototypeToContentHandler = function /*gpf:inline*/ (obj,
            contentHandler, name, attMap) {
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
            contentHandler.startElement("", name, name, xmlAttributes);
            if (subNodeMembers) {
                for (idx = 0; idx < subNodeMembers.length; ++idx) {
                    _objMemberToSubNodes(obj, subNodeMembers[idx],
                        contentHandler, attMap);
                }
            }
        },

        /**
         * Convert the parameter into XML using the provided XML content handler
         *
         * @param {*} obj
         * @param {gpf.interfaces.IXmlContentHandler} contentHandler
         * @param {String} [name="object"] name Name of the root node
         * @private
         */
        _toContentHandler = function (obj, contentHandler, name) {
            var
                attMap = (new gpfA.Map(obj)).filter(_Base),
                attribute;
            // If no 'name', check the Class attribute
            if (!name) {
                attribute = attMap.member("Class").has(_Element);
                if (attribute) {
                    name = attribute.name();
                } else {
                    name = "object";
                }
            }
            // If not an object, serialize the textual representation
            if ("object" !== typeof obj) {
                contentHandler.startElement("", name);
                contentHandler.characters(gpf.value(obj, ""));
            } else {
                _objPrototypeToContentHandler(obj, contentHandler, name,
                    attMap);
            }
            contentHandler.endElement();
        },

        /**
         * Converts this into XML using the provided XML content handler
         *
         * @param {gpf.interfaces.IXmlContentHandler} out XML Content handler
         * @private
         */
        _toXml = function (out) {
            var iContentHandler = gpfI.query(out, gpfI.IXmlContentHandler);
            if (iContentHandler) {
                _toContentHandler(this, iContentHandler);
            } else {
                _expectedXmlContentHandler();
            }
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

            init: function (target) {
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
                        gpf.ASSERT(attArray.length() === 1);
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
            characters: function (buffer) {
                var forward = this._forward[0];
                if (undefined !== forward) {
                    if (0 === forward.type) {
                        forward.iXCH.characters.apply(forward.iXCH, arguments);
                    } else if (1 === forward.type) {
                        forward.buffer.push(buffer);
                    }
                }
                // Ignore
            },

            /**
             * @implements gpf.interfaces.IXmlContentHandler:endDocument
             */
            endDocument: function () {
                // Nothing to do
            },

            /**
             * @implements gpf.interfaces.IXmlContentHandler:endElement
             */
            endElement: function () {
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
            ignorableWhitespace: function (buffer) {
                // Nothing to do
                gpfI.ignoreParameter(buffer);
            },

            /**
             * @implements gpf.interfaces
             *             .IXmlContentHandler:processingInstruction
             */
            processingInstruction: function (target, data) {
                // Not relevant
                gpfI.ignoreParameter(target);
                gpfI.ignoreParameter(data);
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
            startDocument: function () {
                // Nothing to do
            },

            /**
             * @implements gpf.interfaces.IXmlContentHandler:startElement
             */
            startElement: function (uri, localName, qName, attributes) {
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

        _stream: null,
        _branch: [],
        _pendingPrefixMappings: [],

        init: function(stream) {
            this._stream = stream;
            this._branch = [];
            this._pendingPrefixMappings = [];
        },

        _closeLeafForContent: function() {
            var leaf;
            if (this._branch.length) {
                leaf = this._branch[this._branch.length - 1];
                if (!leaf.hasContent) {
                    this._stream.write(">");
                    leaf.hasContent = true;
                }
            }
        },

        //region gpf.interfaces.IXmlContentHandler

        /**
         * @implements gpf.interfaces.IXmlContentHandler:characters
         */
        characters: function (buffer) {
            this._closeLeafForContent();
            this._stream.write(buffer);
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:endDocument
         */
        endDocument: function () {
            // Nothing to do
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:endElement
         */
        endElement: function () {
            var
                leaf = this._branch.pop(),
                stream = this._stream;
            if (leaf.hasContent) {
                stream.write("</");
                stream.write(leaf.qName);
                stream.write(">");
            } else {
                stream.write("/>");
            }
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
        ignorableWhitespace: function (buffer) {
            this._closeLeafForContent();
            this._stream.write(buffer);
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:processingInstruction
         */
        processingInstruction: function (target, data) {
            var
                stream = this._stream;
            stream.write("<?");
            stream.write(target);
            stream.write(" ");
            stream.write(gpf.escapeFor(data, "xml"));
            stream.write("?>");
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
        startDocument: function () {
            // Nothing to do
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:startElement
         */
        startElement: function (uri, localName, qName, attributes) {
            var
                attName,
                attValue,
                idx,
                stream = this._stream;
            if (undefined === qName && !uri) {
                qName = localName;
            }
            this._closeLeafForContent();
            var leaf = {
                hasContent: false,
                qName: qName
            };
            this._branch.push(leaf);
            stream.write("<");
            stream.write(qName);
            if (attributes) {
                for (attName in attributes) {
                    if (attributes.hasOwnProperty(attName)) {
                        stream.write(" ");
                        stream.write(attName);
                        stream.write("=\"");
                        attValue = gpf.escapeFor(attributes[attName].toString(),
                            "xml");
                        if (-1 < attValue.indexOf("\"")) {
                            attValue = gpf.replaceEx(attValue, {
                                "\"": "&quot;"
                            });
                        }
                        stream.write(attValue);
                        stream.write("\"");
                    }
                }
            }
            if (this._pendingPrefixMappings.length) {
                for (idx = 0; idx < this._pendingPrefixMappings.length; ++idx) {
                    stream.write(" ");
                    stream.write(this._pendingPrefixMappings);
                }
                this._pendingPrefixMappings = [];
            }
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:startPrefixMapping
         */
        startPrefixMapping: function (prefix, uri) {
            var
                mapping= ["xmlns:", prefix, ":\"",
                    gpf.escapeFor(uri, "xml"), "\""].join(""),
                leaf = this._branch[this._branch.length],
                stream = this._stream;
            if (leaf.hasContent) {
                this._pendingPrefixMappings.push(mapping);
            } else {
                stream.write(" ");
                stream.write(mapping);
            }
        }

        //endregion
    });

    //endregion

    //region XML Parser
/* TBD
    gpf.xml.Parser = gpf.Parser.extend({

        _contentHandler: null,

        init: function (contentHandler) {
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
     */
    gpf.xml.convert = function (value, out) {
        var
            iContentHandler,
            iXmlSerializable;
        iContentHandler = gpfI.query(out, gpfI.IXmlContentHandler);
        if (!iContentHandler) {
            _expectedXmlContentHandler();
        }
        if ("string" === typeof value) {
            gpf.NOT_IMPLEMENTED();
        } else if ("object" === typeof value) {
            iXmlSerializable = gpfI.query(value, gpfI.IXmlSerializable);
            if (null !== iXmlSerializable) {
                iXmlSerializable.toXml(iContentHandler);
            } else {
                (new gpf.xml.ConstNode(value)).toXml(iContentHandler);
            }
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
                throw {
                    message: "Invalid name"
                };
            }
            return newName;
        }

    });

    //endregion

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/