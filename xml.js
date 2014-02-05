(function(){ /* Begin of privacy scope */
    "use strict";
    /*global document,window,console*/
    /*global process,require,exports,global*/
    /*global gpf*/
    /*jslint continue: true, nomen: true, plusplus: true*/

    var
        // Namespaces shortcut
        gpfI = gpf.interfaces,
        gpfA = gpf.attributes,
        // XML Parser constants
        _XMLPARSER_STATE_NONE = 0
        ;

    gpf.xml = {};

    /*
     Inspired from
     http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
     */
    gpfI.IXmlContentHandler = gpfI.Interface.extend({

        /**
         * Receive notification of character data
         *
         * @param {string} buffer characters
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
         * @param {string} prefix
         */
        endPrefixMapping: function (prefix) {
            gpfI.ignoreParameter(prefix);
        },

        /**
         * Receive notification of ignorable whitespace in element content
         *
         * @param {string} buffer characters
         */
        ignorableWhitespace: function (buffer) {
            gpfI.ignoreParameter(buffer);
        },

        /**
         * Receive notification of a processing instruction
         *
         * @param {string} target
         * @param {string} data
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
         * @param {string} name
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
         * @param {string} uri [uri=""] namespace uri (if any)
         * @param {string} localName
         * @param {string} [qName=localName] qName qualified name
         * @param {object} attributes attribute dictionary (string/string)
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
         * @param {string} prefix
         * @param {string} uri
         */
        startPrefixMapping: function (prefix, uri) {
            gpfI.ignoreParameter(prefix);
            gpfI.ignoreParameter(uri);
        }

    });

    var

        //region XML attributes

        // gpfA.XmlAttribute
        _Base = gpfA.Attribute.extend({

            alterPrototype: function (objPrototype) {
                /*
                 * If not yet defined creates new XML members
                 * - toXml()
                 * - IXmlContentHandler implementation
                 */
                if (undefined === objPrototype.toXml) {
                    // Declare toXml
                    objPrototype.toXml = _toXml;
                    // Declare IXmlContentHandler interface through IUnknown
                    gpfA.add(objPrototype.constructor, "Class",
                        [gpf.$InterfaceImplement(gpfI.IXmlContentHandler,
                            _fromXml)]);
                }
            }

        }),

       // gpfA.XmlIgnoreAttribute = gpf.$XmlIgnore()
        _Ignore = _Base.extend({

            "[Class]": [gpf.$Alias("XmlIgnore")]

        }),

        // gpfA.XmlAttributeAttribute = gpf.$XmlAttribute(name)
        _Attribute = _Base.extend({

            "[Class]": [gpf.$Alias("XmlAttribute")],

            "[_name]": [gpf.$ClassProperty()],
            _name: "",

            init: function (name) {
                this._name = name;
            }

        }),

        _RawElement = _Base.extend({

            "[_name]": [gpf.$ClassProperty()],
            _name: "",

            init: function (name) {
                this._name = name;
            }

        }),

        // gpfA.XmlElementAttribute = gpf.$XmlElement(name, objClass)
        _Element = _RawElement.extend({

            "[Class]": [gpf.$Alias("XmlElement")],

            "[_objClass]": [gpf.$ClassProperty()],
            _objClass: null,

            init: function (name, objClass) {
                this._super(name);
                if (objClass) {
                    this._objClass = objClass;
                }
            }

        }),

        // gpfA.XmlListAttribute = gpf.$XmlList()
        _List = _RawElement.extend({

            "[Class]": [gpf.$Alias("XmlList")]

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
                attMap = (new gpfA.Map(obj)).filter(_Base),
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
                    //noinspection JSUnfilteredForInLoop
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
                    //noinspection JSUnfilteredForInLoop
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
                        //noinspection JSUnfilteredForInLoop
                        subNodeMembers.push(member);
                        continue;
                    }
                    // Else attribute
                    attribute = attArray.has(_Attribute);
                    if (attribute && attribute.name()) {
                        //noinspection JSUnfilteredForInLoop
                        member = attribute.name();
                    } else {
                        //noinspection JSUnfilteredForInLoop
                        if ("_" == member.charAt(0)) {
                            //noinspection JSUnfilteredForInLoop
                            member = member.substr(1);
                        }
                    }
                    if (0 === xmlAttributes) {
                        xmlAttributes = {};
                    }
                    //noinspection JSUnfilteredForInLoop
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

        _toXml = function (obj) {
            var iContentHandler = gpfI.query(obj, gpfI.IXmlContentHandler);
            if (iContentHandler) {
                _toContentHandler(this, iContentHandler);
            } else {
                throw "Invalid parameter, " +
                    + "expected gpf.interfaces.IXmlContentHandler";
            }
        },

        //endregion

        //region FROM XML

        /**
         * Class to handle object deserializtion from XML
         *
         * @private
         */
        _fromXmlContentHandler = gpf.Class.extend({

            // Event if it is not necessary
            "[Class]": [gpf.$InterfaceImplement(gpfI.IXmlContentHandler)],

            _target: null,                          // Object that is serialized
            _firstElement: true,             // startElement has not been called
            _forward: null,                     // subsequent IXmlContentHandler
            _depth: 0,                                       // subsequent depth
            _textBuffer: [],                          // consolidated characters
            _targetMember: [],     // when sub-element has no IXmlContentHandler

            init: function (target) {
                this._target = target;
                this._firstElement = true;
                this._forward = null;
                this._depth = 0;
                this._textBuffer = [];
                this._targetMember = [];
            },

            /*


            _selectChildByName: function (node, name) {
                // Look for the first child having the right name
                var child = node.firstChild;
                while (child) {
                    if (1 === child.nodeType && name === child.localName)
                        return child;
                    child = child.nextSibling;
                }
                return null;
            },
            */

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
                        this._target[attName] =
                            gpf.value(attributes[attName],
                                targetProto[member]);
                    }
                }
            },

            _fillFromElement: function (uri, localName, qName, attributes) {
                var
                    xmlAttributes = new gpfA.Map(this._target)
                        .filter(_RawElement),
                    members,
                    idx,
                    member,
                    attArray,
                    jdx,
                    attribute;
                if (this._targetMember.length) {
                    members = [this._targetMember[0]];
                } else {
                    members = xmlAttributes.members();
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
                var obj;
                if (attribute instanceof _Element) {
                    // Build new object and assign it to the member
                    if (attribute.objClass()) {
                        obj = new (attribute.objClass())();
                        this._target[member] = obj;
                        // Query IXmlContentHandler
                        this._forward = gpfI.query(obj,
                            gpfI.IXmlContentHandler);
                    }
                    // Forward pointer
                    ++this._depth;
                    if (!this._forward) {
                        // No IXmlContentHandler, process as text
                        this._textBuffer = [];
                        this._targetMember.push(member);
                    }
                    return true;
                } else if (attribute instanceof _List) {
                    // The member is an array of objects
                    this._target[member] = [];
                    this._targetMember.push(member);
                    ++this._depth;
                }
                return false;
            },

            //region gpf.interfaces.IXmlContentHandler

            /**
             * @implements gpf.interfaces.IXmlContentHandler:characters
             */
            characters: function (buffer) {
                if (this._forward) {
                    this._forward.characters.apply(this._forward, arguments);
                } else {
                    this._textBuffer.push(buffer);
                }
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
                if (this._forward) {
                    this._forward.endElement.apply(this._forward, arguments);
                } else if (1 === this._depth && this._targetMember.length
                    && this._textBuffer.length) {
                    this._target[this._targetMember[0]] = gpf.value(
                        this._textBuffer.join(""),
                        this._target[this._targetMember[0]]);
                }
                if (0 === --this._depth) {
                    this._forward = null;
                    this._targetMember.shift();
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
                gpfI.ignoreParameter(prefix);
            },

            /**
             * @implements
             *   gpf.interfaces.IXmlContentHandler:processingInstruction
             */
            processingInstruction: function (target, data) {
                // Not relevant
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
                if (this._forward) {
                    ++this._depth;
                    this._forward.startElement.apply(this._forward, arguments);
                } else if (1 === this._depth) {
                    if (this._targetMember.length) {
                        this._fillFromElement.apply(this, arguments);
                    } else {
                        throw 'Not expected';
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
            xmlAttributes = (new gpfA.Map(obj)).filter(gpf.xml.Attribute);
            // Analysis is based on object members, not the XML
            for (member in obj) {
                //noinspection JSUnfilteredForInLoop
                value = obj[ member ];
                type = typeof value;
                // Skip functions
                if ("function" !== type) {
                    // Check member's attributes
                    //noinspection JSUnfilteredForInLoop
                    attributes = xmlAttributes.member(member);
                    // XmlIgnore?
                    if (attributes.has(gpf.XmlIgnoreAttribute))
                        continue;
                    // Default name
                    //noinspection JSUnfilteredForInLoop
                    if ("_" === member.charAt(0)) {
                        //noinspection JSUnfilteredForInLoop
                        name = member.substr(1);
                    } else {
                        //noinspection JSUnfilteredForInLoop
                        name = member;
                    }
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
                        //noinspection JSUnfilteredForInLoop
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
                        if (child) {
                            //noinspection JSUnfilteredForInLoop
                            obj[ member ] = _parseXml(child, type);
                        }
                    } else {
                        // Attribute
                        selectedAttribute = attributes.has(gpf.XmlAttributeAttribute);
                        if (selectedAttribute && selectedAttribute.name())
                            name = selectedAttribute.name();
                        //noinspection JSUnfilteredForInLoop
                        obj[ member ] = gpf.value(node.getAttribute(name), value);
                    }
                }
            }
            return obj;
        },

        _fromXml = function (target) {
            return new _fromXmlContentHandler(target);
        };

        // endregion

    gpf.extend(gpfA, {
        XmlAttribute: _Base,
        XmlIgnoreAttribute: _Ignore,
        XmlElementAttribute: _Element,
        XmlAttributeAttribute: _Attribute,
        XmlListAttribute: _List
    });

    //region XML Writer

    gpf.xml.Writer = gpf.Class.extend({

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
                    //noinspection JSUnfilteredForInLoop
                    stream.write(attName);
                    stream.write("=\"");
                    //noinspection JSUnfilteredForInLoop
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

    //endregion

    //region XML Parser

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

    //endregion

}()); /* End of privacy scope */
