/**
 * @file Generates interfaces as a promise wrapper
 * @since 0.2.8
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*global _gpfPromisify*/ // Converts any value into a Promise
/*#endif*/

function _gpfInterfacesWrap (object, interfaceSpecifier, promise) {
    _gpfObjectForEach(interfaceSpecifier.prototype, function (referenceMethod, name) {
        promise[name] = function () {
            var args = arguments;
            return _gpfInterfacesWrap(object, interfaceSpecifier, promise.then(function () {
                return _gpfPromisify(object[name].apply(object, args));
            }));
        };
    });
    return promise;
}

/**
 * Build promisified interface wrapper
 *
 * @param {Function} interfaceSpecifier Reference interface
 * @return {Function} Interface Wrapper constructor
 * @since 0.2.8
 */
function _gpfInterfacesPromisify (interfaceSpecifier) {
    return function (object) {
        return _gpfInterfacesWrap(object, interfaceSpecifier, Promise.resolve());
    };
}

/**
 * @gpf:sameas _gpfInterfacesPromisify
 * @since 0.2.8
 *
 * @example <caption>IXmlContentHandler wrapper</caption>
 * var wrapXmlContentHandler = gpf.interfaces.promisify(gpf.interfaces.IXmlContentHandler),
 *     writer = new gpf.xml.Writer(),
 *     output = new gpf.stream.WritableString();
 * gpf.stream.pipe(writer, output).then(function () {
 *     console.log(output.toString());
 * });
 * wrapXmlContentHandler(writer)
 *     .startDocument()
 *     .startElement("document")
 *     .endElement();
 * // <document/>
 */
gpf.interfaces.promisify = _gpfInterfacesPromisify;
