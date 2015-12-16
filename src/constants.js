/*#ifndef(UMD)*/
"use strict";
/*exported _GPF_EVENT_ANY*/ // gpf.events.EVENT_ANY
/*exported _GPF_EVENT_CONTINUE*/ // gpf.events.EVENT_CONTINUE
/*exported _GPF_EVENT_DATA*/ // gpf.events.EVENT_DATA
/*exported _GPF_EVENT_END_OF_DATA*/ // gpf.events.EVENT_END_OF_DATA
/*exported _GPF_EVENT_ERROR*/ // gpf.events.EVENT_ERROR
/*exported _GPF_EVENT_READY*/ // gpf.events.EVENT_READY
/*exported _GPF_EVENT_STOP*/ // gpf.events.EVENT_STOP
/*exported _GPF_EVENT_STOPPED*/ // gpf.events.EVENT_STOPPED
/*exported _GPF_FS_TYPE_DIRECTORY*/ // gpf.fs.TYPE_DIRECTORY
/*exported _GPF_FS_TYPE_FILE*/ // gpf.fs.TYPE_FILE
/*exported _GPF_FS_TYPE_NOT_FOUND*/ // gpf.fs.TYPE_NOT_FOUND
/*exported _GPF_FS_TYPE_UNKNOWN*/ // gpf.fs.TYPE_UNKNOWN
/*exported _gpfAlpha*/ // Letters (lowercase)
/*exported _gpfALPHA*/ // Letters (uppercase)
/*exported _gpfCreateConstants*/ // Automate constants creation
/*exported _gpfDigit*/ // Digits
/*exported _gpfFalseFunc*/ // An empty function returning false
/*exported _gpfFunc*/ // Create a new function using the source
/*exported _gpfIdentifierFirstChar*/ // allowed first char in an identifier
/*exported _gpfIdentifierOtherChars*/ // allowed other chars in an identifier
/*exported _gpfJsKeywords*/ //  List of JavaScript keywords
/*exported _gpfMax31*/ // Max value on 31 bits
/*exported _gpfMax32*/ // Max value on 32 bits
/*jshint -W098*/ // This is a constant list, they won't be used in here
/*#endif*/

/*eslint-disable no-unused-vars*/
/*eslint-disable no-undef*/
/*jshint -W079*/ // Globals are also copied here

//region boot
/*global _GPF_HOST_BROWSER*/ // gpf.HOST_BROWSER
/*global _GPF_HOST_NODEJS*/ // gpf.HOST_NODEJS
/*global _GPF_HOST_PHANTOMJS*/ // gpf.HOST_PHANTOMJS
/*global _GPF_HOST_RHINO*/ // gpf.HOST_RHINO
/*global _GPF_HOST_UNKNOWN*/ // gpf.HOST_UNKNOWN
/*global _GPF_HOST_WSCRIPT*/ // gpf.HOST_WSCRIPT
/*global _gpfAssert*/ // Assertion method
/*global _gpfAsserts*/ // Multiple assertion method
/*global _gpfContext*/ // Resolve contextual string
/*global _gpfDosPath*/ // DOS-like path
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfExit*/ // Exit function
/*global _gpfGetBootstrapMethod*/ // Create a method that contains a bootstrap (called only once)
/*global _gpfHost*/ // Host type
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfInBrowser*/ // The current host is a browser like
/*global _gpfInNode*/ // The current host is a nodeJS like
/*global _gpfMainContext*/ // Main context object
/*global _gpfMsFSO*/ // Scripting.FileSystemObject activeX
/*global _gpfNodeFs*/ // Node require("fs")
/*global _gpfNodePath*/ // Node require("path")
/*global _gpfResolveScope*/ // Translate the parameter into a valid scope
/*global _gpfVersion*/ // GPF version
/*global _gpfWebDocument*/ // Browser document object
/*global _gpfWebHead*/ // Browser head tag
/*global _gpfWebWindow*/ // Browser window object
/*global gpfSourcesPath*/ // Global source path
//endregion
//region compatibility
/*global _gpfArraySlice*/ // Slice an array-like object
/*global _gpfJsCommentsRegExp*/ // Find all JavaScript comments
//endregion
//region promise
/*global _GpfDeferredPromise*/ // Deferred promise
//endregion
//region constants
/*global _GPF_EVENT_ANY*/ // gpf.events.EVENT_ANY
/*global _GPF_EVENT_CONTINUE*/ // gpf.events.EVENT_CONTINUE
/*global _GPF_EVENT_DATA*/ // gpf.events.EVENT_DATA
/*global _GPF_EVENT_END_OF_DATA*/ // gpf.events.EVENT_END_OF_DATA
/*global _GPF_EVENT_ERROR*/ // gpf.events.EVENT_ERROR
/*global _GPF_EVENT_READY*/ // gpf.events.EVENT_READY
/*global _GPF_EVENT_STOP*/ // gpf.events.EVENT_STOP
/*global _GPF_EVENT_STOPPED*/ // gpf.events.EVENT_STOPPED
/*global _GPF_FS_TYPE_DIRECTORY*/ // gpf.fs.TYPE_DIRECTORY
/*global _GPF_FS_TYPE_FILE*/ // gpf.fs.TYPE_FILE
/*global _GPF_FS_TYPE_NOT_FOUND*/ // gpf.fs.TYPE_NOT_FOUND
/*global _GPF_FS_TYPE_UNKNOWN*/ // gpf.fs.TYPE_UNKNOWN
/*global _gpfAlpha*/ // Letters (lowercase)
/*global _gpfALPHA*/ // Letters (uppercase)
/*global _gpfCreateConstants*/
/*global _gpfDigit*/ // Digits
/*global _gpfFalseFunc*/ // An empty function returning false
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfIdentifierFirstChar*/ // allowed first char in an identifier
/*global _gpfIdentifierOtherChars*/ // allowed other chars in an identifier
/*global _gpfJsKeywords*/ //  List of JavaScript keywords
/*global _gpfMax31*/ // Max value on 31 bits
/*global _gpfMax32*/ // Max value on 32 bits
//endregion
//region events
/*global _GpfEvent*/ // gpf.Events.Event
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _gpfEventGetPromiseHandler*/ // Event handler wrapper for Promises
/*global _GpfEventsIsValidHandler*/ // Check event handler validity
//endregion
//region include
//endregion
//region base
/*global _gpfExtend*/ // gpf.extend
/*global _gpfNodeBuffer2JsArray*/ // Converts a NodeJS buffer into an int array
/*global _gpfIsArrayLike*/ // Return true if the parameter looks like an array
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*global _gpfStringCapitalize*/ // Capitalize the string
/*global _gpfStringEscapeFor*/ // Make the string content compatible with lang
/*global _gpfStringReplaceEx*/ // String replacement using dictionary map
/*global _gpfValues*/ // Dictionary of value converters
//endregion
//region function
/*global _GpfFunctionBuilder*/ // Function builder
//endregion
//region like
//endregion
//region callback
/*global _gpfBuildParamArray*/ // Build a parameter array
/*global _gpfDoApply*/ // Apply the parameter array through a function
//endregion
//region dispatch
//endregion
//region mimetype
//endregion
//region async
/*global _gpfDefer*/ // Defer the execution of the callback
//endregion
//region bin
//endregion
//region json
/*global _gpfJsonParse*/ // JSON.parse
/*global _gpfJsonStringify*/ // JSON.stringify
//endregion
//region path
/*global _gpfPathDecompose*/ // Normalize path and returns an array of parts
/*global _gpfPathNormalize*/ // Normalize path
//endregion
//region path_matcher
//endregion
//region error
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
//endregion
//region javascript
//endregion
//region csv
/*global _gpfCsvParse*/ // CSV parsing function
//endregion
//region define
/*global _GpfClassDefinition*/ // GPF class definition
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfGenDefHandler*/ // Class handler for class types (interfaces...)
/*global _gpfGetClassDefinition*/ // Get GPF class definition for a constructor
//endregion
//region attributes
/*global _gpfA*/ // gpf.attributes
/*global _gpfAttribute*/ // Shortcut for gpf.attributes.Attribute
/*global _gpfAttributesAdd*/ // Shortcut for gpf.attributes.add
/*global _gpfDecodeAttributeMember*/
/*global _gpfDefAttr*/ // gpf.define for attributes
/*global _gpfEncodeAttributeMember*/
/*global _gpfIArrayGetItem*/ // gpf.interfaces.IReadOnlyArray#getItem factory
/*global _gpfIArrayGetItemsCount*/ // gpf.interfaces.IReadOnlyArray#getItemsCount factory
//endregion
//region a_attributes
//endregion
//region a_class
/*global _gpfANoSerial*/ // gpf.attributes.ClassNonSerializedAttribute
//endregion
//region interfaces
/*global _gpfI*/ // gpf.interfaces
/*global _gpfDefIntrf*/ // gpf.define for interfaces
//endregion
//region i_enumerator
/*global _gpfArrayEnumerator*/ // Create an IEnumerator from an array
//endregion
//region i_array
//endregion
//region i_stream
//endregion
//region i_filestorage
//endregion
//region fs
/*global _gpfFsExploreEnumerator*/ // IFileStorage.explore helper
//endregion
//region fs_node
//endregion
//region fs_ms
//endregion
//region stream
/*global _GPF_BUFREADSTREAM_READ_SIZE*/
/*global _GPF_BUFREADSTREAM_ISTATE_INIT*/
/*global _GPF_BUFREADSTREAM_ISTATE_INPROGRESS*/
/*global _GPF_BUFREADSTREAM_ISTATE_WAITING*/
/*global _GPF_BUFREADSTREAM_ISTATE_EOS*/
/*global _gpfStreamPipe*/ // gpf.stream.pipe implementation
//endregion

//region string
/*global _gpfStringArrayExtract*/ // Extract the first characters of a string array
//endregion


//region encoding
/*global _gpfEncodings*/ // Encodings dictionary
//endregion
//region encoding/utf-8
/*global _GPF_ENCODING_UTF_8*/
//endregion

/*global _GpfNodeStream*/ // gpf.stream.Node
/*global _gpfFromXml*/ // XML deserializer
/*global _gpfToXml*/ // XML serializer
/*global _gpfIsValidXmlName*/ // XML name validation
/*global _GpfXmlBase*/ // XML base attribute
/*global _GpfXmlIgnore*/ // $XmlIgnore
/*global _GpfXmlAttribute*/ // $XmlAttribute
/*global _GpfXmlRawElement*/ // XmlRawElementAttribute
/*global _GpfXmlElement*/ // $XmlElement
/*global _GpfXmlList*/ // $XmlList

var
/*#ifdef(RELEASE)*/
    _gpfTypeofBoolean = "boolean",
    _gpfTypeofFunction = "function",
    _gpfTypeofNumber = "number",
    _gpfTypeofObject = "object",
    _gpfTypeofString = "string",
    _gpfTypeofUndefined = "undefined",
    _gpfUndefined = void 0, //eslint-disable-line no-void
    _gpfTrue = !!1, //eslint-disable-line no-implicit-coercion
    _gpfFalse = !_gpfTrue,
    _gpfNull = null,

    /*#define "boolean" _gpfTypeofBoolean*/
    /*#define "function" _gpfTypeofFunction*/
    /*#define "number" _gpfTypeofNumber*/
    /*#define "object" _gpfTypeofObject*/
    /*#define "string" _gpfTypeofString*/
    /*#define "undefined" _gpfTypeofUndefined*/
    /*#define undefined _gpfUndefined*/
    /*#define true _gpfTrue*/
    /*#define false _gpfFalse*/
    /*#define null _gpfNull*/
/*#endif*/

    //region Events

    _GPF_EVENT_ANY                  = "*",
    _GPF_EVENT_ERROR                = "error",
    _GPF_EVENT_READY                = "ready",
    _GPF_EVENT_DATA                 = "data",
    _GPF_EVENT_END_OF_DATA          = "endOfData",
    _GPF_EVENT_CONTINUE             = "continue",
    _GPF_EVENT_STOP                 = "stop",
    _GPF_EVENT_STOPPED              = "stopped",

    //endregion

    //region File system constants

    _GPF_FS_TYPE_NOT_FOUND          = 0,
    _GPF_FS_TYPE_FILE               = 1,
    _GPF_FS_TYPE_DIRECTORY          = 2,
    _GPF_FS_TYPE_UNKNOWN            = 99,

    //endregion

    // https://github.com/jshint/jshint/issues/525
    _GpfFunc = Function, // avoid JSHint error

    // Max value on 31 bits
    _gpfMax31 = 0x7FFFFFFF,

    // Max value on 32 bits
    _gpfMax32 =  0xFFFFFFFF,

    // Letters (lowercase)
    _gpfAlpha = "abcdefghijklmnopqrstuvwxyz",

    // Letters (uppercase)
    _gpfALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",

    // Digits
    _gpfDigit = "0123456789",

    // List of allowed first char in an identifier
    _gpfIdentifierFirstChar = _gpfAlpha + _gpfALPHA + "_$",

    // List of allowed other chars in an identifier
    _gpfIdentifierOtherChars = _gpfAlpha + _gpfALPHA + _gpfDigit + "_$",

    // TODO update with http://stackoverflow.com/questions/26255/reserved-keywords-in-javascript
    // List of JavaScript keywords
    _gpfJsKeywords = ("break,case,class,catch,const,continue,debugger,default,delete,do,else,export,extends,finally,"
        + "for,function,if,import,in,instanceof,let,new,return,super,switch,this,throw,try,typeof,var,void,while,with,"
        + "yield").split(",")
    ;

// An empty function returning false
function _gpfFalseFunc () {
    return false;
}

/**
 * Create a new function from the source and parameter list.
 * In DEBUG mode, it catches any error to log the problem.
 *
 * @param {String[]} [params=undefined] params Parameter names list
 * @param {String} source
 * @return {Function}
 */
function _gpfFunc (params, source) {
    var args;
    if (undefined === source) {
        source = params;
        params = [];
    }
    _gpfAssert("string" === typeof source && source.length, "Source expected (or use _gpfEmptyFunc)");
    /*#ifdef(DEBUG)*/
    try {
        /*#endif*/
        if (0 === params.length) {
            return _GpfFunc(source);
        }
        args = [].concat(params);
        args.push(source);
        // TODO depending on the environment the result function name is anonymous !
        return _GpfFunc.apply(null, args);
        /*#ifdef(DEBUG)*/
    } catch (e) {
        /* istanbul ignore next */ // Not supposed to happen (not tested)
        console.error("An exception occurred compiling:\r\n" + source);
        /* istanbul ignore next */
        return null;
    }
    /*#endif*/
}

/**
 * Add constants to the provided object
 *
 * @param {Object} obj
 * @param {Object} dictionary
 */
function _gpfCreateConstants (obj, dictionary) {
    var key;
    for (key in dictionary) {
        /* istanbul ignore else */
        if (dictionary.hasOwnProperty(key)) {
            /*gpf:constant*/ obj[key] = dictionary[key];
        }
    }
}

_gpfCreateConstants(gpf, {
    HOST_BROWSER: _GPF_HOST_BROWSER,
    HOST_NODEJS: _GPF_HOST_NODEJS,
    HOST_PHANTOMJS: _GPF_HOST_PHANTOMJS,
    HOST_RHINO: _GPF_HOST_RHINO,
    HOST_UNKNOWN: _GPF_HOST_UNKNOWN,
    HOST_WSCRIPT: _GPF_HOST_WSCRIPT
});
