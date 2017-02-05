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
* `$extend`: Indicates the class to inherit from, it can be either a Class handler (JavaScript function) or a string
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
Even if you can declare add members within the constructor (or by manipulating instances
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

In order to customize how a new object is created, you may add to the definition dictionary a constructor property
associated to a method.

For instance:
```javascript
var A = gpf.define({
    $class: "A",
    _member: "defaultValue",
    getMember: function () {
        return this._member;
    },
    constructor: function (memberValue) {
        if (memberValue) {
            this._member = memberValue;
        }
    }
});
```

Several things to consider:
- This property must be quoted on some hosts (such as WScript)
- All instances owns a [constructor property](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/
Global_Objects/Object/constructor) that **is not** the one set in the definition dictionary.
- The constructor function returned by gpf.define is secured so that you must use it with
[new](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new)

### Inheritance

Class inheritance relies on
[prototype inheritance](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain).

Inherited constructor is not called implicitely.

### this.$super

When [overriding](https://en.wikipedia.org/wiki/Method_overriding) a method, the super one is available through the
method `this.$super()`. Keep in mind that this method is bound statically, meaning that if you modify the super method
by changing the implementation (altering the prototype), $super will still point to the former one.

For instance:
```javascript
gpf.define({
    $class: "B",
    $extend: A,
    "constructor": function (initialValue) {
        this.$super(initialValue);
    },
    getMember: function () {
        return this.$super() + "-inB";
    },
    setMember: function (newValue) {
        this._member = newValue;
    }
});
```

### Supported features

* Because of the way inheritance is implemented, you may define classes with any valid JavaScript class.
* [`instanceof`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof) is supported
