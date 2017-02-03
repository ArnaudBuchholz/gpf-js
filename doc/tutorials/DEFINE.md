The entry point to define entities is {@link gpf.define}. It takes only one parameter: a definition dictionary that is
used to describe the entity to create.
   
The goal of this mechanism is to simplify the description (and generation) of complex objects such as classes,
interfaces and attributes.

## $ properties

$ properties are used to introduce special properties understood by the define API.

Some properties are common to any entity type:

* `$type`: **(required)** Entity type 
* `$name`: **(required)** Entity name
* `$namespace`: **(optional)** When specified, the resulting constructor is defined 
 
Other are specific to entity types.
 
## Class

https://en.wikipedia.org/wiki/Class_(computer_programming)

* `$type`: `class` 
* `$name`: **(required)** Entity name
* `$namespace`: **(optional)** When specified, the resulting constructor is defined 

A class defintion is introduced using `$class: "Name"`
The name may (or may not contain the name)

