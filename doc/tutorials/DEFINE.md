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
* `$abstract`: Supports only the value `true`, defines an abstract class that can't be instantiated

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

When [overriding](https://en.wikipedia.org/wiki/Method_overriding) a method, the parent one is available through the
method `this.$super()`. This method is bound dynamically, meaning that if you modify the super method
by changing the implementation (altering the prototype), $super will always point to the right one.

If you need to access another parent, you may use the syntax `this.$super.methodName()`.

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
    getUppercasedMember: function () {
        return this.$super.getMember().toUpperCase();
    },
    setMember: function (newValue) {
        this._member = newValue;
    }
});
```

Unlike `super`, `this.$super` and `this.$super.methodName` function objects are not equal to the parent ones. Yet they
can be invoked with any given context.

### Supported features

* Because of the way inheritance is implemented, you may define classes with any valid JavaScript class.
* `constructor` property is set to the class constructor
* [`instanceof`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof) is supported

## Interface

The class entity is based on [interface concept](https://en.wikipedia.org/wiki/Public_interface)

* `$type`: `"interface"`
* `$name`: **(required)** Interface name (must start with an uppercase I, validation regexp is `/^I[a-zA-Z0-9]*$/`)
* `$interface`: Shortcut to synthesize `$type`, `$name` and `$namespace`

For instance:

```javascript
var ISerializable = gpf.define({
    $interface: "ISerializable",

    serialize: function (stream) {}
});

var obj = {
    serialize: function (stream) {
    }
};

assert(gpf.interfaces.isImplementedBy(ISerializable, obj));
```

### Members

The goal of an interface is to establish a [contract of service](https://en.wikipedia.org/wiki/Design_by_contract)
between the object implementing the interface and the consumer. Only methods are allowed.
Because an interface exposes only 'public' methods, names must respect the validation regexp
`^[a-z][a-zA-Z0-9]*$`.

### Reserved member names

The following member names are prohibited:
* super
* class
* public
* private
* protected
* static
* mixin
* constructor

### Constructor

An interface can't be instantiated, hence no constructor is allowed.

### Supported features

Interfaces are leveraged through these two APIs:
* {@link gpf.interfaces.isImplementedBy} to check if an object implements a given interface
* {@link gpf.interfaces.query} to query a specific interface either because it implements it or
because it implements the {@link gpf.interfaces.IUnknown} interface.

## Attributes

### Concept

Attributes are used to qualify members of a class definition.
The mechanism is comparable to [Java annotations](https://en.wikipedia.org/wiki/Java_annotation).

### Definition

**Every member** of a class, whatever its type, can own attributes.

The attributes of a member can be set either in the class introducing the member or in any of its subclasses.
Attributes are **inherited**.

On the contrary, it is not possible to set attributes on a member that does not exist in the class hierarchy.

Attributes are objects.
[Literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer) are not
allowed since instances must be created from **a class that is a child of the {@link gpf.attributes.Attribute} class**.

Attributes are always **set in batch (i.e. using an array)**, even for a single attribute.

To set attributes on a member, a special member must be added to the class definition where the name is the member name
enclosed in square brackets.

In the following example, the member value is assigned one attribute that is an instance of the class MyAttribute:

```javascript
MyClass = gpf.define({
    $class: "MyClass",

    "[value]": [new MyAttribute()],
    value: 0
});```

In the following example, MySubClass will own a second attribute for the member value:

```javascript
MySubClass = gpf.define({
    $class: "MySubClass",
    $extend: MyClass,

    "[value]": [new MySecondAttribute()]
});```

Attributes can also be set at the class level, the $ property $attributes introduces them:

```javascript
MySecondClass = gpf.define({
    $class: "MySecondClass",
    $attributes: [new MyClassAttribute()],

    "[value]": [new MyAttribute()],
    value: 0
});```

### Retrieve Attributes

After assigning attributes to a class, the library offers the {@link gpf.attributes.get} API to
query the class definition or one of its instances. As a result, a dictionary mapping members
to their respective list of attributes is returned.

For instance:

```javascript
MyClass = gpf.define({
    $class: "MyClass",

    "[value]": [new MyAttribute()],
    value: 0
});

console.log(gpf.attributes.get(MyClass));
// outputs: {value: [{}]} where the object is the instance of MyAttribute

console.log(gpf.attributes.get(new MyClass()));
// same output
```
