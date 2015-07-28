# GPF Library code style

## Source structure

### Internal variable names

Because there are many way to load the sources, all internal variables of the library are prefixed by:

* **_gpf** for variables (including functions)
* **_Gpf** for classes

### Functions

Functions are documented using [jsduck](https://github.com/senchalabs/jsduck) tags.
In particular:
* @param
* @returns
* @property

And those extensions
* @this

### Documentation

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


