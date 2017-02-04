The library offers one entry point to define entities: {@link gpf.define}.
It takes only one parameter: a definition dictionary that describes the entity to create.

The primary goal of this mechanism is to simplify the description (and generation) of custom entities such as classes,
interfaces and attributes. While the library evolves, it will take advantage of the most recent JavaScript features
(depending on the host) to implement those entities without fundamentally change the way they are described.  

## $ properties

The structure of the definition dictionary depends on the entity to create.
However, some special properties are globally defined in order to provide general or entity-specific information.
They are always introduced with the character $.

Properties that are common to all entity types:

* `$type`: **(required)** Entity type (for instance: `"class"`)
* `$name`: **(required)** Entity name (for instance: `"Sample"`),
it may contain namespace information (for instance: `"tutorial.Sample"`)
* `$namespace`: **(optional)** When specified, the resulting entity constructor is defined to the corresponding object.
For instance: `$namespace: "test.doc", $name: "tutorial.Sample"` will make the entity constructor to be set into
`test.doc.tutorial.Sample`. Validation regexp is: `^(:?[a-z_$][a-zA-Z0-9]+(:?\.[a-z_$][a-zA-Z0-9]+)*)?$`. 

This also means that any property starting with the $ sign will be treated as a special one and may generate validation
errors if not supported by the entity type.

## Class

The class entity is based on [class concepts](https://en.wikipedia.org/wiki/Class_%28computer_programming%29) 

* `$type`: `"class"` 
* `$name`: **(required)** Class name (must start with an uppercase letter, $ or _,
validation regexp is `/^[A-Z_$][a-zA-Z0-9]*$/`)
* `$class`: Shortcut to synthesize `$type`, `$name` and `$namespace`  
* `$extend`: Indicates parent class to inherit from, it can be either a Class handler (JavaScript Function) or a string
giving the contextual path to the Class handler (through {@link gpf.context}).

For instance:

```javascript
var test = {};
var ResultClass = gpf.define({
    $class: "test.EmptyClass"
});
assert(ResultClass === test.EmptyClass);
var instance = new test.EmptyClass();
```

is equivalent to:

```javascript
var test = {};
var ResultClass = gpf.define({
    $type: "class",
    $name: "EmptyClass",
    $namespace: "test"
});
assert(ResultClass === test.EmptyClass);
var instance = new test.EmptyClass();
```

### Members

Provided you respect the expected member names (validation regexp is `^[a-z_][a-zA-Z0-9]*$`)
and you don't use any reserved member names (see below), you may define almost any member you
want.

It is recommended to define both methods and members in the class definition.
Even if you can declare add new members within the constructor (or by manipulating instances
once created), making them known in the entity definition structure will allow latter
optimizations.
 
The same way, the library extensively uses the _ character to indicate private member names.

### Reserved member names

The following member names are prohibited:
* super
* class
* public
* private
* protected
* static
* mixin

### Constructor

.constructor property
"constructor" member of entity definition dictionary
Class handler is NOT 
Secured to be used with new

### Inheritance


### this.$super


### Supported features

* Because of the way inheritance is implemented, you may define classes with any valid JavaScript class parent.
* `instanceof` is supported
* 
  

