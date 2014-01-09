(function(){ /* Begin of privacy scope */
    "use strict";
    /*global document,window,console*/
    /*global process,require,exports,global*/
    /*global gpf*/
    /*jslint continue: true, nomen: true, plusplus: true*/

    gpf.xml = {};

    /*
     Inspired from
     http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
     */
    gpf.interfaces.IXmlContentHandler = gpf.interfaces.Interface.extend({

        /**
         * Receive notification of character data
         *
         * @param {string} buffer characters
         * @param {number} start offset in the current entity
         * @param {number} length number of characters to read
         */
        characters: function (buffer, start, length) {},

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
         * @param {string} prefix
         */
        endPrefixMapping: function (prefix) {},

        /**
         * Receive notification of ignorable whitespace in element content
         *
         * @param {string} buffer characters
         * @param {number} start offset in the current entity
         * @param {number} length number of characters to read
         */
        ignorableWhitespace: function (buffer, start, length) {},

        /**
         * Receive notification of a processing instruction
         *
         * @param {string} target
         * @param {string} data
         */
        processingInstruction: function (target, data) {},

        /**
         * Receive an object for locating the origin of SAX document events.
         *
         * @param {gpf.ILocator} locator
         */
        setDocumentLocator: function (locator) {},

        /**
         * Receive notification of a skipped entity
         *
         * @param {string} name
         */
        skippedEntity: function (name) {},

        /**
         * Receive notification of the beginning of a document
         */
        startDocument: function () {},

        /**
         * Receive notification of the beginning of an element
         *
         * @param {string} uri [uri=""] namespace uri (if any)
         * @param {string} localName
         * @param {string} [qName=localName] qName qualified name
         * @param {object} attributes attribute dictionary (string/string)
         */
        startElement: function (uri, localName, qName, attributes) {},

        /**
         * Begin the scope of a prefix-URI Namespace mapping
         *
         * @param {string} prefix
         * @param {string} uri
         */
        startPrefixMapping: function (prefix, uri) {
        }

    });

    var

        //region XML attributes
        // gpf.attributes.XmlAttribute
        _Base = gpf.attributes.Attribute.extend({

            alterPrototype: function (objPrototype) {
                /*
                 * If not yet defined creates new XML members
                 * - toXml()
                 * - IXmlContentHandler members (+ attribute declaration)
                 */
                if (undefined === objPrototype.toXml) {
                    // Declare toXml
                    objPrototype.toXml = _toXml;
                    // Declare IXmlContentHandler interface
                    gpf.attributes.add(objPrototype.constructor, "Class", [gpf.
                        $InterfaceImplement(gpf.interfaces.IXmlContentHandler)
                    ]);
                    gpf.extend(objPrototype, _fromXml);
                }
            }

        }),

       // gpf.attributes.XmlIgnoreAttribute = gpf.$XmlIgnore()
        _Ignore = _Base.extend({

            "[Class]": [gpf.$Alias("XmlIgnore")]

        }),

        // gpf.attributes.XmlElementAttribute = gpf.$XmlElement(name, objClass)
        _Element = _Base.extend({

            "[Class]": [gpf.$Alias("XmlElement")],

            "[_name]": [gpf.$ClassProperty()],
            _name: "",

            "[_objClass]": [gpf.$ClassProperty()],
            _objClass: null,

            init: function (name, objClass) {
                this._name = name;
                if (objClass) {
                    this._objClass = objClass;
                }
            }

        }),

        // gpf.attributes.XmlAttributeAttribute = gpf.$XmlAttribute(name)
        _Attribute = _Base.extend({

            "[Class]": [gpf.$Alias("XmlAttribute")],

            "[_name]": [gpf.$ClassProperty()],
            _name: "",

            init: function (name) {
                this._name = name;
            }

        }),

        // gpf.attributes.XmlListAttribute = gpf.$XmlList()
        _List = _Base.extend({

            "[Class]": [gpf.$Alias("XmlList")],

            "[_name]": [gpf.$ClassProperty()],
            _name: "",

            init: function (name) {
                this._name = name;
            }

        }),

        //endregion

        //region TO XML
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
            if (null !== result)
                return result;
            else
                return defaultResult;
        },

        _toContentHandler = function (obj, contentHandler, name) {
            var
                attMap = (new gpf.attributes.Map(obj))
                    .filter(_Base),
                attArray,
                attribute,
                member,
                value,
                type,
                subNodeMembers = 0,
                xmlAttributes = 0,
                memberIdx,
                closeNode,
                idx,
                subValue;
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
                contentHandler.startElement('', name);
                contentHandler.characters(obj.toString());
            } else {
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
                    // Check if list or element
                    if (value instanceof Array || attArray.has(_List)
                        || "object" === type || attArray.has(_Element)) {
                        if (0 === subNodeMembers) {
                            subNodeMembers = [];
                        }
                        subNodeMembers.push(member);
                        continue;
                    }
                    // Else attribute
                    attribute = attArray.has(_Attribute);
                    if (attribute && attribute.name()) {
                        member = attribute.name();
                    } else if ("_" == member.charAt(0)) {
                        member = member.substr(1);
                    }
                    if (0 === xmlAttributes) {
                        xmlAttributes = {};
                    }
                    xmlAttributes[member] = value.toString();
                }
                contentHandler.startElement('', name, name, xmlAttributes);
                if (subNodeMembers) {
                    for (memberIdx = 0; memberIdx < subNodeMembers.length;
                         ++memberIdx) {
                        member = subNodeMembers[memberIdx];
                        value = obj[member];
                        // Exception for dates
                        if (value instanceof Date) {
                            value = gpf.dateToComparableFormat(value, true);
                        }
                        attArray = attMap.member(member);
                        if ("_" == member.charAt(0)) {
                            member = member.substr(1);
                        }
                        // Check if list
                        attribute = attArray.has(_List);
                        if (value instanceof Array || attribute) {
                            // TODO: what to do when value is empty?
                            if (attribute && attribute.name()) {
                                closeNode = true;
                                contentHandler.startElement('',
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
                            continue; // Next
                        }
                        attribute = attArray.has(_Element);
                        // Element
                        if (attribute && attribute.name()) {
                            name = attribute.name();
                        }
                        _toContentHandler(value, contentHandler, name);
                    }
                }
            }
            contentHandler.endElement();
        },

        _toXml = function (contentHandler) {
            if (gpf.interfaces.isImplementedBy(contentHandler,
                gpf.interfaces.IXmlContentHandler)) {
                _toContentHandler(this, contentHandler);
            } else {
                throw "Invalid parameter, " +
                    + "expected gpf.interfaces.IXmlContentHandler";
            }
        },

        //endregion

        //region FROM XML

        _selectByName = function (array, name) {
            var
                idx,
                attribute,
                result = null;
            for (idx = 0; idx < array.length(); ++idx) {
                attribute = array.get(idx);
                if (!(attribute instanceof _Element)) {
                    continue;
                }
                if (attribute.name()) {
                    if (attribute.name() === name) {
                        return attribute;
                    }
                }
                else if (!result) {
                    result = attribute;
                }
            }
            return result;
        },

        _selectChildByName = function (node, name) {
            // Look for the first child having the right name
            var child = node.firstChild;
            while (child) {
                if (1 === child.nodeType && name === child.localName)
                    return child;
                child = child.nextSibling;
            }
            return null;
        },


        _parseXml = function (node, objClass) {
            var
                obj,
                xmlAttributes,
                attributes,
                member,
                name,
                value,
                type,
                selectedAttribute,
                child;
            // Date object
            if (objClass === Date)
                return gpf.dateFromComparableFormat(node.innerHTML);
            // Instanciate a new object
            obj = new objClass();
            xmlAttributes = (new gpf.AttributesMap(obj)).filter(gpf.xml.Attribute);
            // Analysis is based on object members, not the XML
            for (member in obj) {
                value = obj[ member ];
                type = typeof value;
                // Skip functions
                if ("function" !== type) {
                    // Check member's attributes
                    attributes = xmlAttributes.member(member);
                    // XmlIgnore?
                    if (attributes.has(gpf.XmlIgnoreAttribute))
                        continue;
                    // Default name
                    if ("_" === member.charAt(0))
                        name = member.substr(1);
                    else
                        name = member;
                    // Check if list
                    selectedAttribute = attributes.has(gpf.XmlListAttribute);
                    if (value instanceof Array || selectedAttribute) {
                        // Root node for the list
                        if (selectedAttribute && selectedAttribute.name())
                            child = _selectChildByName(node, selectedAttribute.name());
                        else
                            child = node;
                        if (null === child)
                            continue;
                        value = [];
                        // Enumerate children and check if any correspond to a specific XmlElement
                        child = child.firstChild;
                        while (child) {
                            if (1 === child.nodeType) { // Element
                                selectedAttribute = _selectByName(attributes, child.localName);
                                if (selectedAttribute) {
                                    if (selectedAttribute.objClass())
                                        value.push(_parseXml(child, selectedAttribute.objClass()));
                                    else
                                        value.push(child.innerHTML);
                                }
                            }
                            child = child.nextSibling;
                        }
                        obj[ member ] = value;
                        continue;
                    }
                    // Check if element
                    selectedAttribute = attributes.has(gpf.XmlElementAttribute);
                    if ("object" === type || selectedAttribute) {
                        type = undefined;
                        // Element
                        if (selectedAttribute) {
                            if (selectedAttribute.name())
                                name = selectedAttribute.name();
                            if (selectedAttribute.objClass())
                                type = selectedAttribute.objClass();
                        }
                        // Look for the first child having the right name
                        child = _selectChildByName(node, name);
                        if (child)
                            obj[ member ] = _parseXml(child, type);
                    } else {
                        // Attribute
                        selectedAttribute = attributes.has(gpf.XmlAttributeAttribute);
                        if (selectedAttribute && selectedAttribute.name())
                            name = selectedAttribute.name();
                        obj[ member ] = gpf.value(node.getAttribute(name), value);
                    }
                }
            }
            return obj;
        },

        _fromXml = {

        };

        // endregion

    gpf.extend(gpf.attributes, {
        XmlAttribute: _Base,
        XmlIgnoreAttribute: _Ignore,
        XmlElementAttribute: _Element,
        XmlAttributeAttribute: _Attribute,
        XmlListAttribute: _List
    });

    gpf.xml.Writer = gpf.Class.extend({

        "[Class]": [gpf.$InterfaceImplement(gpf.interfaces.IXmlContentHandler)],

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
        characters: function (buffer, start, length) {
            gpf.interfaces.ignoreParameter(start);
            gpf.interfaces.ignoreParameter(length);
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
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:ignorableWhitespace
         */
        ignorableWhitespace: function (buffer, start, length) {
            gpf.interfaces.ignoreParameter(start);
            gpf.interfaces.ignoreParameter(length);
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
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:skippedEntity
         */
        skippedEntity: function (name) {
            // Nothing to do
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
                    stream.write(" ");
                    stream.write(attName);
                    stream.write("=\"");
                    attValue = gpf.escapeFor(attributes[attName], "xml");
                    if (-1 < attValue.indexOf("\"")) {
                        attValue = gpf.replaceEx(attValue, {
                            "\"": "&quot;"
                        });
                    }
                    stream.write(attValue);
                    stream.write("\"");
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

    gpf.extend(gpf.xml, {

        parse: function (source, contentHandler) {

        }


    } );

}()); /* End of privacy scope */
