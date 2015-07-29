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

### Naming conventions

Identifiers are using [lowerCamelCase](https://en.wikipedia.org/wiki/CamelCase) naming convention except for constants
that are uppercase.

Because there are many way to load the sources and, in particular, one evaluates everything in the global context,
all internal variables of the library are prefixed by:

* **_gpf** for variables and functions
* **_Gpf** for classes
* **_GPF** for constants

### Functions

Functions that are used outside of the source are documented using [jsduck](https://github.com/senchalabs/jsduck) tags.

In particular:

* @param
* @returns
* @property
* @inheritdoc <namespace/class>:<method>

And those extensions
* @this
* @chainable

For global methods: *@private* means it remains internal to the library, *@public* means it is exposed.

variables are all declared at the beginning of the functions.

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

## Formatting

The project comes with an [.editorconfig file](http://editorconfig.org/).

All files are using UTF-8 encoding with DOS-like carriage return.

### Max line length

The maximum line length has recently been changed from 80 to 120.
When breaking a line, the following principles are applied:

```javascript

functionCall("long parameter one", "long parameter two

```

### Indentation

Indeen


