## Source structure

### Source

All source file must be using [ASCII encoding](https://en.wikipedia.org/wiki/ASCII) and
[UNIX-like carriage return](https://en.wikipedia.org/wiki/Carriage_return).
They end with an empty line.

If specific character must be used, the [Unicode escape sequence](https://developer.mozilla.org/en-US/docs/Web/
JavaScript/Reference/Lexical_grammar#String_literals) can be used.

Sources start with:

```javascript
/*#ifndef(UMD)*/
"use strict";
/*global 'IMPORTED' VARIABLE OR FUNCTIONS*/ // Brief description of the import
/*exported 'EXPORTED' VARIABLE OR FUNCTIONS*/ // Bried description of the export
/*#endif*/
```

Consequently, [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) is applied
everywhere.

Globals and exported are written to make sure that the linter can relate to:

* Variables or functions that are declared in a different source *(documentation will be imported from the corresponding
exported comment by the build process)*
* Variables or functions that are being declared without being used in this source *(exported comment must be used)*

They are sorted alphabetically automatically by the build process.

## Coding style

### Formatting

The project comes with an [.editorconfig file](http://editorconfig.org/).

The maximum line length is set to 120.

When breaking a line, the following principles are applied:

* The new line is indented
* The line break should ideally occur after a comma

Example:

```javascript
_gpfAssert(handler instanceof Array || _gpfEventsIsValidHandler(handler),
    "Expected a valid output handler");
```

### Naming conventions

Identifiers are using [lowerCamelCase](https://en.wikipedia.org/wiki/CamelCase) naming convention except for constants
that are uppercase.

Because there are many way to load the sources and, in particular, one evaluates everything in the global context,
all internal variables of the library are prefixed by:

* **_gpf** for variables and functions
* **_Gpf** for classes or object type definition
* **_GPF** for constants

### Documentation

There are three levels of documentation:

- Sources must have a [@file](https://jsdoc.app/tags-file.html) tag to provide summary of module content.

- Functions, classes, constants that are exposed by the library (there should not be any variable).
  They are easily distinguished as they all belong to the gpf namespace.

- Functions, classes and variables (including constants) that are exposed by any source and might be reused in a
  different source. They do not belong to the gpf namespace (but they must start with **_gpf** as explained in the naming
  convention).

Any other function / class / variable that are internal to sources might not be documented (hoping they are clear
enough). Within a class declaration (leveraging gpf.define), members visibility is based on public / private / protected
modifiers.

Documentation is based on [jsdoc](https://jsdoc.app/) tags.

In particular:

* [@param](https://jsdoc.app/tags-param.html)
  Must be specified with type and description (and optional specification)
* [@return](https://jsdoc.app/tags-returns.html)
  If the function does not return anything, do not use @return {undefined} or @return {void}
* [@readonly](https://jsdoc.app/tags-readonly.html)
* [@inheritdoc](https://jsdoc.app/tags-inheritdoc.html) (<namespace/class>#<method>)
  Can be detected if inheritance is clear and function names are the same
* [@constructor](https://jsdoc.app/tags-class.html)
  Can be detected when the class is defined by gpf.define
* [@extends](https://jsdoc.app/tags-augments.html)
  Can be detected when the class is defined by gpf.define or recognizing the syntax A.prototype = new B
* [@alias](https://jsdoc.app/tags-alias.html)
* [@this](https://jsdoc.app/tags-this.html)

However, and as much as possible, documentation generation should rely on simple patterns to detect properties.
For instance, the following situation is easily recognizable:

```javascript
_gpfDefAttr("$UniqueAttribute", _gpfAttrConstraint, {

    private: {

         /** The attribute is unique for the whole class when true or per member when false */
        _classScope: true

    },
```

Should generate the properties @private and @type {Boolean}

Some 'extensions' are defined
* @gpf:forwardThis: the scope of the function is forwarded to the callback function
* @gpf:closure: if the function *directly* creates a closure
* @gpf:chainable: indicates that the result of the method is the object itself, allowing method chaining
* @gpf:read *memberName*: indicates a read accessor on a given member
* @gpf:write *memberName*: indicates a write accessor on a given member
* @gpf:sameas *referenceName*: copy the documentation of referenceName

It happens sometimes that a variable might be assigned different function versions (to manage host compatibilities).
The placeholder selected to insert documentation must make the variable path clear. For instance:

```javascript

// Handle timeouts (mandatory for some environments)
gpf.handleTimeout = _gpfEmptyFunc;

/* ... */
if ("undefined" === typeof setTimeout) {

    /* ... */

    /** @gpf:sameas _gpfHandleTimeout */
    gpf.handleTimeout = _gpfHandleTimeout;

```

A counter example (where both private and public version exist):

```javascript
/**
 * Extends the destination object by copying own enumerable properties from the source object.
 * If the member already exists, it is overwritten.
 *
 * @param {Object} destination Destination object
 * @param {...Object} source Source objects
 * @return {Object} Destination object
 */
function _gpfExtend (destination, source) {
    _gpfIgnore(source);
    [].slice.call(arguments, 1).forEach(function (nthSource) {
        _gpfObjectForEach(nthSource, _gpfAssign, destination);
    });
    return destination;
}

/** @gpf:sameas _gpfExtend */
gpf.extend = _gpfExtend;
```

If a parameter documentation needs several lines, text should start at the beginning of each line.
[Markdown](http://en.wikipedia.org/wiki/Markdown) formatting helpers can be used:

```javascript
    /**
     * To implement gpf.noConflict(), we need to keep the previous content of gpf.
     * Makes sense only for the following hosts:
     * - phantomjs
     * - browser
     * - unknown
     *
     * @type {undefined|Object}
     */
    _gpfConflictingSymbol,
```

Errors are automatically documented when the {@link _gpfErrorDeclare} API is used.

### Assertions

Two functions are provided for assertions:

```javascript
/**
 * Assertion helper
 *
 * @param {Boolean} condition Truthy / [Falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) value
 * @param {String} message Assertion message explaining the violation when the condition is false
 * @throws {gpf.Error.AssertionFailed}
 */
_gpfAssert = function (condition, message) {/*...*/}

/**
 * Batch assertion helper
 *
 * @param {Object} assertions Dictionary of messages associated to condition values
 * @throws {gpf.Error.AssertionFailed}
 */
_gpfAsserts = function (assertions) {/*...*/}
```

Ideally, there should be only one assertion per function (to reduce the number of necessary instructions), this is the
reason why `_gpfAsserts` was introduced.
The message of the assertion **must** be the evaluated condition.

For instance:

```javascript
_gpfAssert(value instanceof _gpfAttribute, "Expected an Attribute-like parameter");
```

### Comments

Following Robert Martin's excellent Clean Code principles, comments should be reduced to the minimum.
When needed:

* Comments standing on one line **must** use //
* Comments on multiple lines **must** use /* */

Ending dots are optional. They must be added to separate sentences (new line is not enough).

For instance:

```javascript
    /**
     * This comment stands on one line, no ending dot is required
     *
     * @type {Object}
     */
```

```javascript
    /**
     * For this comment, two lines are needed.
     * That's why a dot was added on the previous line.
     *
     * @type {Object}
     */
```

### Special comments

Some preprocessing instructions are defined inside comments:

```javascript
/*#ifdef(DEBUG)*/
/*#else*/
/*#endif*/
```

### Variables declaration

Variables are grouped as much as possible: for instance, if the variable is used in one function only, its declaration
will remain close to the function where it is used.

Multiple variable declaration should be grouped in one var statement. Alignment of the first variable depends on the
comment it may have.

```javascript
var first,
    second,
    third;

var
    // Whatever the documentation
    commentedFirst,
    second;
```

### Functions

Prefer the named function syntax over the variable one.

Function variables are all declared at the beginning of the function.
If a function create closures, the @gpf:closure tag is added.

Functions signatures are checked by some APIs, hence it is important to declare all parameters. If they are not used,
and to avoid linter warning, the _gpfIgnore function might be used: you may pass all unused parameters.

### Classes

GPF Library provides its own mechanism to define classes.
To encapsulate the notion of member accessors, no public member is exposed by built-in classes.
The convention is to create getter/setter functions which name is based on the member name:

```javascript
instance.getName() // Read the name property
instance.setName("newValue") // Write the name property
```

*THIS MIGHT BE REVIEWED TO INCREASE CODE CLARITY*

Classes definition allows defining the visibility of members through the public, protected, private and static keywords.
To increase the readability of the class declaration, the following structure is proposed:

```javascript
gpf.define("ClassName", {
    static: {

        myStaticMethod: function() {}

    },
    private: {

        _myPrivateProperty: 0,

        _myPrivateMethod: function() {}

    },
    protected: {

        _myProtectedProperty: 0,

        _myProtectedMethod: function() {}

    },
    public: {

        myPublicMethod: function() {}

    }
});
```

### Forbidden syntaxes

The use of the [conditional ternary operator]
(https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator) is prohibited.

The following keywords are prohibited:

* [with](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/with)
* [switch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch)

as well as the
[ternary operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator)

*EXPLANATIONS WILL BE GIVEN LATER*

### Particular syntaxes

Variable initialisation:
the following syntax

```javascript
function sample (fromIndex) {
    var index = fromIndex || 0;
}
```

is sometimes used to reduce the following:

```javascript
function sample (fromIndex) {
    var index;
    if (undefined === fromIndex) {
        fromIndex = 0;
    }
}
```

## JShint validations

The project comes with an [.jhsintrc file](http://jshint.com/docs/).

In particular:

Option | Value | Comment
---- | ---- | ----
indent | 4 | checks formatting
quotmark | "double" | strings must be consistent everywhere
maxlen | 120 | maximum line length
camelcase | true | checks identifiers
maxstatements | 15 | limit the number of statements per function
maxparams | 3 | maximum of 3 parameters per function
maxdepth| 4 | no more than 4 nested blocks
maxcomplexity | 6 | limits cyclomatic complexity

### Turning off JSHint warnings

Turning off a warning or an error is allowed provided a comment explains why

The following syntax is used on internal constructors as the function name starts with _Gpf (and it is not detected
as a valid constructor function).

```javascript
/*jshint validthis:true*/
```

Or it may be temporarily turned of using -W040 / +W040 as the following:

```javascript
    /*jshint -W040*/ // This is the common way to get the global context
    // Main context object
    _gpfMainContext = this,
    /*jshint +W040*/
```

## ESLint validations

The project comes with an [.eslsintrc file](http://eslint.org/docs/user-guide/configuring).

It overlaps JSHint validation and has more checks.

## Code coverage

Turning off istanbul is allowed provided a comment explains why the code is skipped.

These comments are consolidated inside the {@tutorial COVERAGE} page, an ID is allocated for each
and reported in the source.

For instance:

```javascript
_gpfAsserts = function (messages) {
    for (var message in messages) {
        /* istanbul ignore else */ // hasOwnProperty.1
        if (messages.hasOwnProperty(message)) {
            _gpfAssert(messages[message], message);
        }
    }
};
```

## Code quality

[Plato](https://github.com/es-analysis/plato) is used to evaluate the code quality.
The target maintainability for each source is to be at least 70 (*configurable*).
