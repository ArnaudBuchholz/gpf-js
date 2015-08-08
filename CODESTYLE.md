# GPF Library code style

## Source structure

### Source

All sources start with:

```javascript
/*#ifndef(UMD)*/
"use strict";
/*global 'IMPORTED' VARIABLE OR FUNCTIONS*/
/*exported 'EXPORTED' VARIABLE OR FUNCTIONS*/
/*#endif*/
```

Consequently, [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) is applied
everywhere.

Globals and exported are written to make sure that JSHint can relate to:

* Variables or functions that are declared in a different source
* Variables or functions that are being declared without being used in this source

They are sorted alphabetically.

 A list of available *global* variables is consolidated in the **constants** source, it is organized like the following:

```javascript
//region compatibility
/*global _gpfArraySlice*/ // Shortcut on Array.prototype.slice
/*global _gpfSetReadOnlyProperty*/ // gpf.setReadOnlyProperty
//endregion
```

where the region provides the source name.

## Coding style

### Formatting

The project comes with an [.editorconfig file](http://editorconfig.org/).

All files are using UTF-8 encoding with DOS-like carriage return.

The maximum line length has recently been changed from 80 to 120.
When breaking a line, the following principles are applied:

```javascript
functionCall("long parameter one", "long parameter two
```

### Naming conventions

Identifiers are using [lowerCamelCase](https://en.wikipedia.org/wiki/CamelCase) naming convention except for constants
that are uppercase.

Because there are many way to load the sources and, in particular, one evaluates everything in the global context,
all internal variables of the library are prefixed by:

* **_gpf** for variables and functions
* **_Gpf** for classes
* **_GPF** for constants

### Documentation

There are two levels of documentation:

- Functions, classes, constants that are exposed by the library (there should not be any variable).
  They are easily distinguished as they all belong to the gpf namespace.

- Functions, classes and variables (including constants) that are exposed by any source and might be reused in a
  different source. They do not belong to the gpf namespace (but they must start with _gpf as explained in the naming
  convention).

Any other function / class / variable that are internal to sources might not be documented (hoping they are clear
enough). Within a class declaration (leveraging gpf.define), members visibility is based on public / private / protected
modifiers.

Documentation is based on [jsduck](https://github.com/senchalabs/jsduck) tags.

In particular:

* [@param](https://github.com/senchalabs/jsduck/wiki/%40param)
  Must be specified with type (and optional specification)
* [@return](https://github.com/senchalabs/jsduck/wiki/%40return)
* [@property](https://github.com/senchalabs/jsduck/wiki/%40property)
  Can be detected if a member is not a function (type might be based on prototype value)
* [@readonly](https://github.com/senchalabs/jsduck/wiki/%40readonly)
* [@chainable](https://github.com/senchalabs/jsduck/wiki/%40chainable)
  Can be detected if all function paths returns this
* [@inheritdoc](https://github.com/senchalabs/jsduck/wiki/%40inheritdoc) (<namespace/class>#<method>)
  Can be detected if inheritance is clear and function names are the same
* [@class](https://github.com/senchalabs/jsduck/wiki/%40class)
  Can be detected when the class is defined by gpf.define
* [@extends](https://github.com/senchalabs/jsduck/wiki/%40extends)
  Can be detected when the class is defined by gpf.define or recognizing the syntax A.prototype = new B
* [@alias](https://github.com/senchalabs/jsduck/wiki/%40alias)
* [@constructor](https://github.com/senchalabs/jsduck/wiki/%40constructor)
  Can be detected on the function name (must be constructor in gpf.define)

However, and as much as possible, documentation generation should rely on simple patterns to detect properties.
For instance, the following situation is easily recognizable:

```javascript
_gpfDefAttr("$UniqueAttribute", _gpfAttrConstraint, {

    private: {

         // The attribute is unique for the whole class when true or per member when false.
        _classScope: true

    },
```

Some 'extensions' are defined
* @this: if the scope of the function has to be clarified it provides the type and explanations
* @forwardThis: the scope of the function is fowarded to the callback function
* @closure: if the function *directly* creates a closure

It happens sometimes that a variable might be assigned different function versions (to manage host compatibilities).
The placeholder selected to insert documentation must make the variable path clear. For instance:

A counter example (where both private & public version exist):

```javascript
/**
 * @inheritdoc gpf:extend
 * Implementation of gpf.extend
 */
_gpfExtend = function (dictionary, properties, overwriteCallback) {
    /* ... */
}

_gpfExtend(gpf, {

    /*
     * Appends members of properties to the dictionary object.
     * If a conflict has to be handled (i.e. member exists on both objects),
     * the overwriteCallback has to handle it.
     *
     * @param {Object} dictionary
     * @param {Object} properties
     * @param {Function} overwriteCallback
     * @return {Object} the modified dictionary
     * @chainable
     */
    extend: _gpfExtend,
```

### Comments

Following Robert Martin's excellent Clean Code principles, comments should be reduced to the minimum.
When needed:

* Comments standing on one line **must** use //
* Comments on multiple lines **must** use /* */

### Variables declaration

To simplify minification, functions are always using function declaration.
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

Function variables are all declared at the beginning of the function.
If a function create closures, the @closure tag is added.

Functions signatures are checked by some APIs, hence it is important to declare all parameters. If they are not used,
and to avoid JSHint warning, the _gpfIgnore function might be used: you may pass all unused parameters.

### Classes

GPF Library provides its own mechanism to define classes.
To encapsulate the notion of member accessors, no public member is exposed by built-in classes.
The convention is to create getter/setter functions which name is based on the member name:

```javascript
instance.getName() // Read the name property
instance.setName("newValue") // Write the name property
```

*THIS MIGHT BE REVIEWED TO INCREASE CODE CLARITY

### Forbidden syntaxes

The use of the [conditional ternary operator]
(https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator) is prohibited.

The following keywords are prohibited:

* with
* switch

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

Turning off a warning is allowed provided a comment explains why this is turned off

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

## Code testing
