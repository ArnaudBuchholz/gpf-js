The library offers a way to organize your project by creating separate source files (a.k.a. modules) with dependencies.
The {@see gpf.require.define} API is the main entry point. 

resources => module or static resources

A module has several properties:
- Its scope is private, it decides what is exposed
- Dependencies are loaded first and then made available to the module

Whatever the chosen module format, the very first call must be {@see gpf.require.define}.
The factory function is optional and a promised is returned to know whe nthe dependant modules are loaded.
Once the initial call is made, the API supports several formats.

Once loaded, any modification applied to the module is saved. Unless the cache is cleared.

## JSON file

JSON files are loaded, parsed and the result object is associated to the resource. 

## GPF Module

In general, the `gpf` symbol is always available. It allows you to access the global context through the
`{@see gpf.context}` API.
In particular, you may define a gpf module using {@see gpf.require.define}.

```JavaScript
gpf.require.define({
    name1: "dependency1.js",
    name2: "dependency2.js",
    // ...
    nameN: "dependencyN.js"
    
}, function (require) {
    "use strict";
    // Private scope

    require.name1.api1();
    
    // Implementation

    // Interface
    return {

        api1: function (/*...*/) {
            /*...*/
        },

        // ...
        
        apiN: function (/*...*/) {
            /*...*/
        }
        
    };

});
```
 
## Asynchronous Module Definition (AMD)

The [AMD](https://en.wikipedia.org/wiki/Asynchronous_module_definition) format

```JavaScript
define("amd", [
    "dependency1.js",
    "dependency2.js",
    /*...*/,
    "dependencyN.js"
], function (name1, name2, /*...*/ nameN) {
    "use strict";
    // Private scope
    
    name1.api1();
    
    // Implementation

    // Interface
    return {

        api1: function (/*...*/) {
            /*...*/
        },

        // ...
        
        apiN: function (/*...*/) {
            /*...*/
        }
        
    };

});
```

Or a shorter version (no name)

```JavaScript
define([
    "dependency1.js",
    "dependency2.js",
    /*...*/,
    "dependencyN.js"
], function (name1, name2, /*...*/ nameN) {
    "use strict";
    // Private scope
    
    name1.api1();
    
    // Implementation

    // Interface
    return {

        api1: function (/*...*/) {
            /*...*/
        },

        // ...
        
        apiN: function (/*...*/) {
            /*...*/
        }
        
    };

});
```

Even shorter if you don't need dependencies:

```JavaScript
define(function () {
    "use strict";
    // Private scope
    
    // Implementation

    // Interface
    return {

        api1: function (/*...*/) {
            /*...*/
        },

        // ...
        
        apiN: function (/*...*/) {
            /*...*/
        }
        
    };

});
```

## CommonJS

The [CommonJS](https://en.wikipedia.org/wiki/CommonJS) format:

```JavaScript
"use strict";
// Private scope

var name1 = require("dependency1.js"),
    name2 = require("dependency2.js"),
    // ...
    nameN = require("dependencyN.js");
    
name1.api1();

// Implementation

// Interface
module.exports = {

    api1: function (/*...*/) {
        /*...*/
    },

    // ...
    
    apiN: function (/*...*/) {
        /*...*/
    }

};
```
