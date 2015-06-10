/*#ifndef(UMD)*/
"use strict";
/*global _gpfA*/ // gpf.attributes
/*global _gpfI*/ // gpf.interfaces
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _GpfXmlBase*/ // XML base attribute
/*global _GpfXmlIgnore*/ // $XmlIgnore
/*global _GpfXmlAttribute*/ // $XmlAttribute
/*global _GpfXmlRawElement*/ // XmlRawElementAttribute
/*global _GpfXmlElement*/ // $XmlElement
/*global _GpfXmlList*/ // $XmlList
/*exported _gpfToXml*/
/*exported _gpfFromXml*/
/*#endif*/

/*jshint forin:false*/ // Need to inspect all members of the prototype

var
// Namespaces shortcut
    gpfFireEvent = gpf.events.fire

/*
 // XML Parser constants
 _XMLPARSER_STATE_NONE = 0
 */
    ;

gpf.xml = {};

var

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
            if (!(attribute instanceof _GpfXmlElement)) {
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
        if (value instanceof Array || attArray.has(_GpfXmlList)
            || "object" === type || attArray.has(_GpfXmlElement)) {
            return ""; // Not an attribute
        }
        // Else attribute
        attribute = attArray.has(_GpfXmlAttribute);
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
     * Convert the parameter into XML using the provided XML content handler
     *
     * @param {*} obj
     * @param {gpf.interfaces.wrap(IXmlContentHandler)} wrapped
     * @param {String} [name="object"] name Name of the root node
     * @private
     */
    _toContentHandler = function (obj, wrapped, name) {
        var
            attMap = (new _gpfA.Map(obj)).filter(_GpfXmlBase),
            attribute;
        // If no 'name', check the Class attribute
        if (!name) {
            attribute = attMap.member("Class").has(_GpfXmlElement);
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
            wrapped.startElement("", name);
            wrapped.characters(gpf.value(obj, ""));
        } else {
            _objPrototypeToContentHandler(obj, wrapped, name,
                attMap);
        }
        wrapped.endElement();
    },

    /**
     * Convert the object member into XML using the provided XML content
     * handler
     *
     * @param {Object} obj
     * @param {String} member Member name
     * @param {gpf.interfaces.wrap(IXmlContentHandler)} wrapped
     * @param {gpf.attributes.Map} attMap Map filled with XML attributes
     * @private
     */
    _objMemberToSubNodes = function /*gpf:inline*/ (obj, member,
                                                    wrapped, attMap) {
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
        attribute = attArray.has(_GpfXmlList);
        if (value instanceof Array || attribute) {
            // TODO: what to do when value is empty?
            if (attribute && attribute.name()) {
                closeNode = true;
                wrapped.startElement("",
                    attribute.name());
            }
            // Get the list of 'candidates'
            attArray = attArray.filter(_GpfXmlElement);
            for (idx = 0; idx < value.length; ++idx) {
                subValue = value[ idx ];
                // Select the right candidate
                type = _selectByType(attArray, subValue);
                if (type && type.name()) {
                    name = type.name();
                } else {
                    name = "item";
                }
                _toContentHandler(subValue, wrapped,
                    name);
            }
            if (closeNode) {
                wrapped.endElement();
            }
            return;
        }
        attribute = attArray.has(_GpfXmlElement);
        // Element
        if (attribute && attribute.name()) {
            name = attribute.name();
        }
        _toContentHandler(value, wrapped, name);
    },

    /**
     * Convert the object into XML using the provided XML content handler
     *
     * @param {Object} obj
     * @param {gpf.interfaces.wrap(IXmlContentHandler)} wrapped
     * @param {String} [name="object"] name Name of the root node
     * @param {gpf.attributes.Map} attMap Map filled with XML attributes
     * @private
     */
    _objPrototypeToContentHandler = function /*gpf:inline*/ (obj, wrapped, name,
        attMap) {
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
            if (attArray.has(_GpfXmlIgnore)) {
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
        wrapped.startElement("", name, name, xmlAttributes);
        if (subNodeMembers) {
            for (idx = 0; idx < subNodeMembers.length; ++idx) {
                _objMemberToSubNodes(obj, subNodeMembers[idx],
                    wrapped, attMap);
            }
        }
    },

    /**
     * Converts this into XML using the provided XML content handler
     *
     * @@implements gpf.interfaces.IIXmlSerializable:toXml
     * @private
     */
    _gpfToXml = function (out, eventsHandler) {
        var
            WXmlContentHandler =
                gpf.interfaces.wrap(_gpfI.IXmlContentHandler),
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
    FromXmlContentHandler = _gpfDefine("FromXmlContentHandler", {

        // Even if it is not necessary, let be precise
        "[Class]": [gpf.$InterfaceImplement(_gpfI.IXmlContentHandler)],

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
                xmlAttributes = new _gpfA.Map(this._target),
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
                    .filter(_GpfXmlAttribute);
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
                xmlAttributes = new _gpfA.Map(this._target)
                    .filter(_GpfXmlRawElement),
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
            if (attribute instanceof _GpfXmlElement) {
                // Build new object and assign it to the member
                if (attribute.objClass()) {
                    obj = new (attribute.objClass())();
                    this._target[member] = obj;
                    // Query IXmlContentHandler
                    forward = _gpfI.query(obj, _gpfI.IXmlContentHandler);
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
            } else if (attribute instanceof _GpfXmlList) {
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
            gpfFireEvent.apply(this, ["ready", eventsHandler]);
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:endDocument
         */
        endDocument: function (eventsHandler) {
            gpfFireEvent.apply(this, ["ready", eventsHandler]);
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
            gpfFireEvent.apply(this, ["ready", eventsHandler]);
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:endPrefixMapping
         */
        endPrefixMapping: function (prefix) {
            // Nothing to do (?)
            _gpfI.ignoreParameter(prefix);
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:ignorableWhitespace
         */
        ignorableWhitespace: function (buffer, eventsHandler) {
            // Nothing to do
            _gpfI.ignoreParameter(buffer);
            gpfFireEvent.apply(this, ["ready", eventsHandler]);
        },

        /**
         * @implements gpf.interfaces
         *             .IXmlContentHandler:processingInstruction
         */
        processingInstruction: function (target, data, eventsHandler) {
            // Not relevant
            _gpfI.ignoreParameter(target);
            _gpfI.ignoreParameter(data);
            gpfFireEvent.apply(this, ["ready", eventsHandler]);
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:setDocumentLocator
         */
        setDocumentLocator: function (locator) {
            // Nothing to do
            _gpfI.ignoreParameter(locator);
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:skippedEntity
         */
        skippedEntity: function (name) {
            // Nothing to do
            _gpfI.ignoreParameter(name);
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:startDocument
         */
        startDocument: function (eventsHandler) {
            // Nothing to do
            gpfFireEvent.apply(this, ["ready", eventsHandler]);
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
            gpfFireEvent.apply(this, ["ready", eventsHandler]);
        },

        /**
         * @implements gpf.interfaces.IXmlContentHandler:startPrefixMapping
         */
        startPrefixMapping: function (prefix, uri) {
            // Nothing to do (?)
            _gpfI.ignoreParameter(prefix);
            _gpfI.ignoreParameter(uri);
        }

        //endregion

    }),

    _gpfFromXml = function (target) {
        return new FromXmlContentHandler(target);
    };

// endregion